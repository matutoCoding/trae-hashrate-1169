import { create } from 'zustand';
import type {
  DroneFleet,
  PerformanceSlot,
  OccupancyBlock,
  MergeLog,
  SplitLog,
  ApprovalFlow,
  ApprovalRequest,
  ReminderRecord,
  AirspaceReport,
  Organizer,
  User,
  DashboardStats,
  MergeCandidate,
} from '@/types';
import {
  mockFleets,
  mockSlots,
  mockOccupancies,
  mockMergeLogs,
  mockSplitLogs,
  mockApprovalFlows,
  mockApprovalRequests,
  mockReminders,
  mockAirspaceReports,
  mockOrganizers,
  mockUsers,
  mockDashboardStats,
} from '@/data/mockData';
import { findMergeCandidates, executeMerge } from '@/services/mergeService';
import { executeSplit as doSplit } from '@/services/splitService';
import { createAutoReminder, createEscalation, createManualReminder, getCurrentNodeDeadlines, type NodeDeadlineInfo } from '@/services/timeoutService';
import { genId } from '@/utils/formatters';

interface AppState {
  currentUser: User;
  fleets: DroneFleet[];
  slots: PerformanceSlot[];
  occupancies: OccupancyBlock[];
  mergeLogs: MergeLog[];
  splitLogs: SplitLog[];
  approvalFlows: ApprovalFlow[];
  approvalRequests: ApprovalRequest[];
  reminders: ReminderRecord[];
  airspaceReports: AirspaceReport[];
  organizers: Organizer[];
  users: User[];
  dashboardStats: DashboardStats;

  mergeCandidates: MergeCandidate[];
  recomputeMergeCandidates: () => void;

  nodeDeadlines: NodeDeadlineInfo[];
  recomputeNodeDeadlines: () => void;

  createSlot: (slot: Omit<PerformanceSlot, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSlot: (id: string, patch: Partial<PerformanceSlot>) => void;

  mergeOccupancy: (candidateId: string, remark?: string) => { ok: boolean; message?: string };
  splitOccupancy: (
    occupancyId: string,
    splitPoint: string,
    reason: string
  ) => { ok: boolean; message?: string };

  sendReminder: (approvalRequestId: string, toEscalation?: boolean) => { ok: boolean; message?: string };
  processApprovalAction: (
    requestId: string,
    action: 'approve' | 'reject',
    comment: string
  ) => { ok: boolean; message?: string };

  createFleet: (fleet: Omit<DroneFleet, 'id' | 'createdAt'>) => void;
  updateFleet: (id: string, patch: Partial<DroneFleet>) => void;
}

const initialUser: User = mockUsers[1];

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: initialUser,
  fleets: mockFleets,
  slots: mockSlots,
  occupancies: mockOccupancies,
  mergeLogs: mockMergeLogs,
  splitLogs: mockSplitLogs,
  approvalFlows: mockApprovalFlows,
  approvalRequests: mockApprovalRequests,
  reminders: mockReminders,
  airspaceReports: mockAirspaceReports,
  organizers: mockOrganizers,
  users: mockUsers,
  dashboardStats: mockDashboardStats,

  mergeCandidates: [],
  recomputeMergeCandidates: () => {
    const candidates = findMergeCandidates(get().slots);
    set({ mergeCandidates: candidates });
  },

  nodeDeadlines: [],
  recomputeNodeDeadlines: () => {
    const { approvalRequests, approvalFlows } = get();
    const deadlines = getCurrentNodeDeadlines(approvalRequests, approvalFlows);
    set({ nodeDeadlines: deadlines });
  },

  createSlot: (slot) => {
    const newSlot: PerformanceSlot = {
      ...slot,
      id: genId('s_'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set(state => ({ slots: [...state.slots, newSlot] }));
    setTimeout(() => get().recomputeMergeCandidates(), 0);
  },

  updateSlot: (id, patch) => {
    set(state => ({
      slots: state.slots.map(s =>
        s.id === id ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s
      ),
    }));
    setTimeout(() => get().recomputeMergeCandidates(), 0);
  },

  mergeOccupancy: (candidateId, remark) => {
    const { mergeCandidates, currentUser } = get();
    const candidate = mergeCandidates.find(c => c.id === candidateId);
    if (!candidate) return { ok: false, message: '未找到该合并候选' };
    const { occupancy, mergeLog, updatedSlotIds } = executeMerge(
      candidate,
      currentUser.id,
      currentUser.name,
      remark
    );
    set(state => ({
      occupancies: [...state.occupancies, occupancy],
      mergeLogs: [...state.mergeLogs, mergeLog],
      slots: state.slots.map(s =>
        updatedSlotIds.includes(s.id) ? { ...s, occupancyId: occupancy.id, updatedAt: new Date().toISOString() } : s
      ),
    }));
    setTimeout(() => get().recomputeMergeCandidates(), 0);
    return { ok: true };
  },

  splitOccupancy: (occupancyId, splitPoint, reason) => {
    const { occupancies, slots, currentUser } = get();
    const occ = occupancies.find(o => o.id === occupancyId);
    if (!occ) return { ok: false, message: '未找到该占用记录' };
    const result = doSplit(occ, slots, splitPoint, reason, currentUser.id, currentUser.name);
    const idsToRemove = occ.slotIds.filter(id => !result.newSlots.find(ns => ns.id === id));
    const keptSlots = slots.filter(s => !idsToRemove.includes(s.id));
    const updatedSlots = keptSlots.map(s => {
      const nb = result.newSlots.find(n => n.id === s.id);
      if (nb) return nb;
      if (result.beforeOcc.slotIds.includes(s.id)) return { ...s, occupancyId: result.beforeOcc.id };
      if (result.afterOcc.slotIds.includes(s.id)) return { ...s, occupancyId: result.afterOcc.id };
      return s;
    });
    const allSlots = [
      ...updatedSlots,
      ...result.newSlots.filter(ns => !updatedSlots.find(s => s.id === ns.id)).map(ns => ({
        ...ns,
        occupancyId: result.beforeOcc.slotIds.includes(ns.id) ? result.beforeOcc.id : result.afterOcc.id,
      })),
    ];
    set(state => ({
      occupancies: [
        ...state.occupancies.map(o => o.id === occupancyId ? { ...o, status: 'split' as const } : o),
        result.beforeOcc,
        result.afterOcc,
      ],
      splitLogs: [...state.splitLogs, result.splitLog],
      slots: allSlots,
    }));
    return { ok: true };
  },

  sendReminder: (requestId, toEscalation = false) => {
    const { nodeDeadlines, currentUser, approvalRequests } = get();
    const info = nodeDeadlines.find(d => d.approvalRequestId === requestId);
    if (!info) return { ok: false, message: '未找到该审批节点' };
    const reminder = createManualReminder(info, currentUser.id, currentUser.name, toEscalation);
    const trackItem = {
      id: genId('t_'),
      nodeId: info.nodeId,
      nodeName: info.nodeName,
      operatorId: currentUser.id,
      operatorName: currentUser.name,
      action: 'remind' as const,
      comment: toEscalation && info.escalationTargetName
        ? `人工升级催办至${info.escalationTargetName}`
        : `人工催办${info.assigneeName}`,
      timestamp: new Date().toISOString(),
    };
    set(state => ({
      reminders: [...state.reminders, reminder],
      approvalRequests: state.approvalRequests.map(r =>
        r.id === requestId ? { ...r, timeline: [...r.timeline, trackItem] } : r
      ),
    }));
    return { ok: true };
  },

  processApprovalAction: (requestId, action, comment) => {
    const { approvalRequests, approvalFlows, currentUser } = get();
    const req = approvalRequests.find(r => r.id === requestId);
    if (!req) return { ok: false, message: '未找到该审批单' };
    const flow = approvalFlows.find(f => f.id === req.flowId);
    if (!flow) return { ok: false, message: '未找到审批流程' };
    const currentNode = flow.nodes.find(n => n.order === req.currentNodeOrder);
    if (!currentNode) return { ok: false, message: '当前节点无效' };
    const trackItem = {
      id: genId('t_'),
      nodeId: currentNode.id,
      nodeName: currentNode.name,
      operatorId: currentUser.id,
      operatorName: currentUser.name,
      action,
      comment,
      timestamp: new Date().toISOString(),
    };
    let newStatus = req.status;
    let newNodeOrder = req.currentNodeOrder;
    if (action === 'reject') {
      newStatus = 'rejected';
    } else if (action === 'approve') {
      const nextOrder = req.currentNodeOrder + 1;
      const hasNext = flow.nodes.some(n => n.order === nextOrder);
      if (hasNext) {
        newNodeOrder = nextOrder;
        const submitItem = {
          id: genId('t_'),
          nodeId: flow.nodes.find(n => n.order === nextOrder)!.id,
          nodeName: flow.nodes.find(n => n.order === nextOrder)!.name,
          operatorId: currentUser.id,
          operatorName: currentUser.name,
          action: 'submit' as const,
          comment: `${currentNode.name}通过，报送下一节点`,
          timestamp: new Date().toISOString(),
        };
        set(state => ({
          approvalRequests: state.approvalRequests.map(r =>
            r.id === requestId
              ? { ...r, currentNodeOrder: newNodeOrder, timeline: [...r.timeline, trackItem, submitItem] }
              : r
          ),
        }));
        setTimeout(() => get().recomputeNodeDeadlines(), 0);
        return { ok: true };
      } else {
        newStatus = 'approved';
      }
    }
    set(state => ({
      approvalRequests: state.approvalRequests.map(r =>
        r.id === requestId
          ? { ...r, status: newStatus, currentNodeOrder: newNodeOrder, timeline: [...r.timeline, trackItem] }
          : r
      ),
    }));
    setTimeout(() => get().recomputeNodeDeadlines(), 0);
    return { ok: true };
  },

  createFleet: (fleet) => {
    const newFleet: DroneFleet = {
      ...fleet,
      id: genId('f_'),
      createdAt: new Date().toISOString(),
    };
    set(state => ({ fleets: [...state.fleets, newFleet] }));
  },

  updateFleet: (id, patch) => {
    set(state => ({
      fleets: state.fleets.map(f => f.id === id ? { ...f, ...patch } : f),
    }));
  },
}));

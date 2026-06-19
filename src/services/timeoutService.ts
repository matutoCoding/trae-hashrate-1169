import type { ApprovalRequest, ApprovalFlow, ReminderRecord, ApprovalTrackItem } from '@/types';
import { calcDeadline, isAfter, isTimeout as checkTimeout, getRemainingTime, addHours, parseISO } from '@/utils/dateUtils';
import { genId } from '@/utils/formatters';

export interface NodeDeadlineInfo {
  approvalRequestId: string;
  slotTitle: string;
  nodeId: string;
  nodeName: string;
  nodeOrder: number;
  assigneeId: string;
  assigneeName: string;
  deadline: string;
  escalationTargetId?: string;
  escalationTargetName?: string;
  escalateAfterHours: number;
  remaining: { hours: number; minutes: number; seconds: number; isOverdue: boolean };
  hoursSinceSubmit: number;
  isEscalated: boolean;
  escalationPending: boolean;
}

export const getCurrentNodeDeadlines = (
  requests: ApprovalRequest[],
  flows: ApprovalFlow[]
): NodeDeadlineInfo[] => {
  const results: NodeDeadlineInfo[] = [];
  for (const req of requests) {
    if (req.status === 'approved' || req.status === 'rejected') continue;
    const flow = flows.find(f => f.id === req.flowId);
    if (!flow) continue;
    const currentNode = flow.nodes.find(n => n.order === req.currentNodeOrder);
    if (!currentNode) continue;
    const deadline = calcDeadline(req.submissionTime, currentNode.timeoutHours);
    const remaining = getRemainingTime(deadline);
    const hoursSinceSubmit = (Date.now() - parseISO(req.submissionTime).getTime()) / (1000 * 60 * 60);
    const isEscalated = req.status === 'escalated';
    const escalationPending = hoursSinceSubmit >= currentNode.escalateAfterHours;
    results.push({
      approvalRequestId: req.id,
      slotTitle: req.slotTitle,
      nodeId: currentNode.id,
      nodeName: currentNode.name,
      nodeOrder: currentNode.order,
      assigneeId: currentNode.assigneeId,
      assigneeName: currentNode.assigneeName,
      deadline,
      escalationTargetId: currentNode.escalationTargetId,
      escalationTargetName: currentNode.escalationTargetName,
      escalateAfterHours: currentNode.escalateAfterHours,
      remaining,
      hoursSinceSubmit,
      isEscalated,
      escalationPending,
    });
  }
  return results;
};

export const createAutoReminder = (
  info: NodeDeadlineInfo
): { reminder: ReminderRecord; trackItem: ApprovalTrackItem } => {
  const now = new Date().toISOString();
  return {
    reminder: {
      id: genId('r_'),
      approvalRequestId: info.approvalRequestId,
      slotTitle: info.slotTitle,
      nodeId: info.nodeId,
      nodeName: info.nodeName,
      assigneeId: info.assigneeId,
      assigneeName: info.assigneeName,
      deadline: info.deadline,
      reminderTime: now,
      isAuto: true,
      isEscalation: false,
      status: 'sent',
    },
    trackItem: {
      id: genId('t_'),
      nodeId: info.nodeId,
      nodeName: info.nodeName,
      operatorId: 'system',
      operatorName: '系统自动',
      action: 'remind',
      comment: `节点超时（${info.hoursSinceSubmit.toFixed(1)}小时未处理），系统自动发送催办通知至${info.assigneeName}`,
      timestamp: now,
      isTimeout: true,
    },
  };
};

export const createEscalation = (
  info: NodeDeadlineInfo
): { reminder: ReminderRecord; trackItem: ApprovalTrackItem } | null => {
  if (!info.escalationTargetId || !info.escalationTargetName) return null;
  const now = new Date().toISOString();
  return {
    reminder: {
      id: genId('r_'),
      approvalRequestId: info.approvalRequestId,
      slotTitle: info.slotTitle,
      nodeId: info.nodeId,
      nodeName: info.nodeName,
      assigneeId: info.escalationTargetId,
      assigneeName: info.escalationTargetName,
      deadline: info.deadline,
      reminderTime: now,
      isAuto: true,
      isEscalation: true,
      status: 'sent',
    },
    trackItem: {
      id: genId('t_'),
      nodeId: info.nodeId,
      nodeName: info.nodeName,
      operatorId: 'system',
      operatorName: '系统自动',
      action: 'escalate',
      comment: `催办${info.escalateAfterHours}小时仍未处理，自动升级至${info.escalationTargetName}`,
      timestamp: now,
      isTimeout: true,
    },
  };
};

export const createManualReminder = (
  info: NodeDeadlineInfo,
  operatorId: string,
  operatorName: string,
  sendToEscalation: boolean = false
): ReminderRecord => {
  const now = new Date().toISOString();
  return {
    id: genId('r_'),
    approvalRequestId: info.approvalRequestId,
    slotTitle: info.slotTitle,
    nodeId: info.nodeId,
    nodeName: info.nodeName,
    assigneeId: sendToEscalation && info.escalationTargetId ? info.escalationTargetId : info.assigneeId,
    assigneeName: sendToEscalation && info.escalationTargetName ? info.escalationTargetName : info.assigneeName,
    deadline: info.deadline,
    reminderTime: now,
    isAuto: false,
    isEscalation: sendToEscalation,
    operatorId,
    operatorName,
    status: 'sent',
  };
};

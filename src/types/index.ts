export type FleetStatus = 'available' | 'in_use' | 'maintenance';
export type SlotStatus = 'draft' | 'confirmed' | 'approved' | 'completed' | 'cancelled';
export type OccupancyStatus = 'active' | 'split' | 'cancelled';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'escalated';
export type ApprovalAction = 'submit' | 'approve' | 'reject' | 'escalate' | 'remind';
export type ReminderStatus = 'sent' | 'delivered' | 'read';
export type AviationStatus = 'not_required' | 'pending' | 'submitted' | 'approved' | 'rejected';
export type QualificationLevel = 'A' | 'B' | 'C';
export type UserRole = 'admin' | 'scheduler' | 'organizer' | 'approver' | 'auditor';

export interface DroneFleet {
  id: string;
  name: string;
  droneCount: number;
  droneModel: string;
  maxAltitude: number;
  maxFlightTime: number;
  status: FleetStatus;
  location: string;
  createdAt: string;
}

export interface PerformanceSlot {
  id: string;
  title: string;
  organizerId: string;
  organizerName: string;
  fleetId: string;
  fleetName: string;
  startTime: string;
  endTime: string;
  status: SlotStatus;
  airspaceArea: string;
  estimatedAttendance: number;
  description?: string;
  occupancyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OccupancyBlock {
  id: string;
  organizerId: string;
  organizerName: string;
  fleetId: string;
  fleetName: string;
  startTime: string;
  endTime: string;
  slotIds: string[];
  isMerged: boolean;
  mergedFromIds?: string[];
  status: OccupancyStatus;
  createdAt: string;
}

export interface MergeLog {
  id: string;
  mergedOccupancyId: string;
  sourceOccupancyIds: string[];
  operatorId: string;
  operatorName: string;
  operationTime: string;
  remark?: string;
}

export interface SplitLog {
  id: string;
  sourceOccupancyId: string;
  resultOccupancyIds: string[];
  splitPoint: string;
  operatorId: string;
  operatorName: string;
  reason: string;
  operationTime: string;
}

export interface ApprovalNode {
  id: string;
  name: string;
  order: number;
  assigneeId: string;
  assigneeName: string;
  timeoutHours: number;
  escalateAfterHours: number;
  escalationTargetId?: string;
  escalationTargetName?: string;
}

export interface ApprovalFlow {
  id: string;
  name: string;
  nodes: ApprovalNode[];
  isActive: boolean;
}

export interface ApprovalTrackItem {
  id: string;
  nodeId: string;
  nodeName: string;
  operatorId: string;
  operatorName: string;
  action: ApprovalAction;
  comment?: string;
  timestamp: string;
  isTimeout?: boolean;
}

export interface ApprovalRequest {
  id: string;
  slotId: string;
  slotTitle: string;
  flowId: string;
  flowName: string;
  currentNodeOrder: number;
  status: ApprovalStatus;
  submissionTime: string;
  timeline: ApprovalTrackItem[];
  attachments: string[];
}

export interface ReminderRecord {
  id: string;
  approvalRequestId: string;
  slotTitle: string;
  nodeId: string;
  nodeName: string;
  assigneeId: string;
  assigneeName: string;
  deadline: string;
  reminderTime: string;
  isAuto: boolean;
  isEscalation: boolean;
  operatorId?: string;
  operatorName?: string;
  status: ReminderStatus;
}

export interface AirspaceReport {
  id: string;
  slotId: string;
  slotTitle: string;
  coordinates: { lat: number; lng: number }[];
  altitudeRange: { min: number; max: number };
  civilAviationStatus: AviationStatus;
  militaryAviationStatus: AviationStatus;
  reportNumber?: string;
  documents: { name: string; url: string; type: string }[];
  createdAt: string;
}

export interface Organizer {
  id: string;
  name: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  companyType: string;
  qualificationLevel: QualificationLevel;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  department?: string;
}

export interface MergeCandidate {
  id: string;
  organizerId: string;
  organizerName: string;
  fleetId: string;
  fleetName: string;
  slots: PerformanceSlot[];
  startTime: string;
  endTime: string;
  totalHours: number;
}

export interface DashboardStats {
  todayPerformances: number;
  pendingApprovals: number;
  timeoutWarnings: number;
  fleetUtilization: number;
  weeklyTrend: { date: string; count: number }[];
  statusDistribution: { name: string; value: number }[];
  fleetRadarData: { subject: string; value: number; fullMark: number }[];
  todaySchedule: { time: string; title: string; status: SlotStatus; organizer: string }[];
}

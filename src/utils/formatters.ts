import type { SlotStatus, OccupancyStatus, ApprovalStatus, AviationStatus, FleetStatus, UserRole, QualificationLevel } from '@/types';

export const slotStatusMap: Record<SlotStatus, { label: string; className: string; dotColor: string }> = {
  draft: { label: '草稿', className: 'bg-text-muted/20 text-text-muted border-text-muted/30', dotColor: 'bg-text-muted' },
  confirmed: { label: '已确认', className: 'bg-primary/20 text-primary-light border-primary/40', dotColor: 'bg-primary-light' },
  approved: { label: '审批通过', className: 'bg-success/20 text-success border-success/40', dotColor: 'bg-success' },
  completed: { label: '已完成', className: 'bg-info/20 text-info border-info/40', dotColor: 'bg-info' },
  cancelled: { label: '已取消', className: 'bg-danger/20 text-danger border-danger/40', dotColor: 'bg-danger' },
};

export const occupancyStatusMap: Record<OccupancyStatus, { label: string; className: string }> = {
  active: { label: '占用中', className: 'bg-accent/20 text-accent border-accent/40' },
  split: { label: '已拆分', className: 'bg-warning/20 text-warning border-warning/40' },
  cancelled: { label: '已取消', className: 'bg-danger/20 text-danger border-danger/40' },
};

export const approvalStatusMap: Record<ApprovalStatus, { label: string; className: string }> = {
  pending: { label: '审批中', className: 'bg-primary/20 text-primary-light border-primary/40' },
  approved: { label: '已通过', className: 'bg-success/20 text-success border-success/40' },
  rejected: { label: '已驳回', className: 'bg-danger/20 text-danger border-danger/40' },
  escalated: { label: '已升级', className: 'bg-warning/20 text-warning border-warning/40' },
};

export const aviationStatusMap: Record<AviationStatus, { label: string; className: string }> = {
  not_required: { label: '无需报备', className: 'bg-text-muted/20 text-text-muted border-text-muted/30' },
  pending: { label: '待提交', className: 'bg-info/20 text-info border-info/40' },
  submitted: { label: '已提交', className: 'bg-primary/20 text-primary-light border-primary/40' },
  approved: { label: '已批准', className: 'bg-success/20 text-success border-success/40' },
  rejected: { label: '已驳回', className: 'bg-danger/20 text-danger border-danger/40' },
};

export const fleetStatusMap: Record<FleetStatus, { label: string; className: string; pulse?: boolean }> = {
  available: { label: '可用', className: 'bg-success/20 text-success border-success/40' },
  in_use: { label: '执行任务', className: 'bg-accent/20 text-accent border-accent/40', pulse: true },
  maintenance: { label: '维护中', className: 'bg-warning/20 text-warning border-warning/40' },
};

export const userRoleMap: Record<UserRole, { label: string; className: string }> = {
  admin: { label: '系统管理员', className: 'bg-danger/20 text-danger border-danger/40' },
  scheduler: { label: '排期管理员', className: 'bg-primary/20 text-primary-light border-primary/40' },
  organizer: { label: '主办方', className: 'bg-info/20 text-info border-info/40' },
  approver: { label: '空域审批员', className: 'bg-accent/20 text-accent border-accent/40' },
  auditor: { label: '运营督查', className: 'bg-warning/20 text-warning border-warning/40' },
};

export const qualificationMap: Record<QualificationLevel, { label: string; className: string }> = {
  A: { label: 'A级资质', className: 'bg-success/20 text-success border-success/40' },
  B: { label: 'B级资质', className: 'bg-primary/20 text-primary-light border-primary/40' },
  C: { label: 'C级资质', className: 'bg-warning/20 text-warning border-warning/40' },
};

export const formatNumber = (num: number, locale: string = 'zh-CN'): string => {
  return new Intl.NumberFormat(locale).format(num);
};

export const formatPercent = (num: number, decimals: number = 1): string => {
  return `${(num * 100).toFixed(decimals)}%`;
};

export const genId = (prefix: string = ''): string => {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substr(2, 6)}`;
};

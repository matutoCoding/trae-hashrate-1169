import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, CheckCircle, XCircle, Clock, Bell, AlertTriangle, User, MessageSquare,
  Send, FileCheck, ChevronRight, AlertOctagon,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAppStore } from '@/store/appStore';
import { formatDateTime } from '@/utils/dateUtils';
import type { ApprovalAction, ApprovalNode } from '@/types';

const actionInfo: Record<ApprovalAction, { label: string; icon: any; color: string }> = {
  submit: { label: '提交', icon: Send, color: 'text-primary-light bg-primary/20 border-primary/40' },
  approve: { label: '通过', icon: CheckCircle, color: 'text-success bg-success/20 border-success/40' },
  reject: { label: '驳回', icon: XCircle, color: 'text-danger bg-danger/20 border-danger/40' },
  escalate: { label: '升级', icon: AlertTriangle, color: 'text-warning bg-warning/20 border-warning/40' },
  remind: { label: '催办', icon: Bell, color: 'text-accent bg-accent/20 border-accent/40' },
};

const getNodeState = (node: ApprovalNode, req: any, flow: any) => {
  const isRejected = req.status === 'rejected';
  const rejectedNode = isRejected ? flow.nodes.find((n: any) => n.order === req.currentNodeOrder) : null;
  if (req.status === 'approved') return 'done';
  if (isRejected && rejectedNode?.id === node.id) return 'rejected';
  if (node.order < req.currentNodeOrder) return 'done';
  if (node.order === req.currentNodeOrder) return req.status === 'escalated' ? 'escalated' : 'current';
  return 'pending';
};

export default function ApprovalTrackPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { approvalRequests, approvalFlows, processApprovalAction } = useAppStore();
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const req = useMemo(() => approvalRequests.find(r => r.id === id), [approvalRequests, id]);
  const flow = useMemo(() => req ? approvalFlows.find(f => f.id === req.flowId) : null, [approvalFlows, req]);
  const timeline = useMemo(() => [...(req?.timeline || [])].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ), [req]);

  const canAction = req && (req.status === 'pending' || req.status === 'escalated');

  const handleAction = (action: 'approve' | 'reject') => {
    if (!req) return;
    setActionLoading(action);
    setTimeout(() => {
      processApprovalAction(req.id, action, comment || (action === 'approve' ? '同意通过' : '予以驳回'));
      setComment('');
      setActionLoading(null);
    }, 400);
  };

  if (!req || !flow) {
    return (
      <div className="p-6">
        <button onClick={() => nav(-1)} className="btn-secondary mb-6 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> 返回列表
        </button>
        <div className="glass-card p-16 text-center">
          <AlertOctagon className="w-16 h-16 text-warning mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">审批单不存在</h2>
          <p className="text-text-secondary">未找到ID为 <span className="font-mono">{id}</span> 的报批记录</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <button onClick={() => nav('/approval/list')} className="btn-secondary p-2 mt-1 shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="section-title m-0">{req.slotTitle}</h1>
                <StatusBadge kind="approval" status={req.status} pulse={req.status === 'escalated'} />
              </div>
              <p className="text-text-muted text-sm flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5"><FileCheck className="w-4 h-4" />报批ID: <span className="font-mono text-text-secondary">{req.id}</span></span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />提交于 {formatDateTime(req.submissionTime)}</span>
                <span className="flex items-center gap-1.5">流程: <span className="text-text-secondary">{flow.name}</span></span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6 relative overflow-hidden">
        <div className="absolute -top-10 left-1/3 w-40 h-40 rounded-full bg-accent/5 blur-3xl" />
        <h3 className="card-title mb-6 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-gradient-to-b from-primary to-accent" />
          节点进度
        </h3>
        <div className="relative">
          <div className="flex items-start justify-between gap-2">
            {flow.nodes.map((node, idx) => {
              const state = getNodeState(node, req, flow);
              const iconProps = {
                done: { Icon: CheckCircle, cls: 'text-success bg-success/20 border-success/50', line: 'from-success to-success' },
                current: { Icon: Clock, cls: 'text-primary-light bg-primary/30 border-primary/60 shadow-glow-primary animate-glow-pulse', line: 'from-success/50 to-primary/30' },
                escalated: { Icon: AlertTriangle, cls: 'text-warning bg-warning/30 border-warning/60 shadow-glow-warning animate-glow-pulse', line: 'from-success/50 to-warning/50' },
                rejected: { Icon: XCircle, cls: 'text-danger bg-danger/20 border-danger/50', line: 'from-success/50 to-danger/30' },
                pending: { Icon: Clock, cls: 'text-text-muted bg-bg-secondary border-border', line: '' },
              }[state];
              const { Icon, cls, line } = iconProps;
              const isLast = idx === flow.nodes.length - 1;
              return (
                <div key={node.id} className="flex-1 flex flex-col items-center relative">
                  {!isLast && (
                    <div className="absolute top-5 left-1/2 w-full h-0.5 -translate-y-1/2 z-0 overflow-hidden">
                      <div className={`h-full ${line ? `bg-gradient-to-r ${line}` : 'bg-border'}`} />
                      {(state === 'done' || state === 'current' || state === 'escalated' || state === 'rejected') && line && (
                        <motion.div
                          className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 3, delay: idx * 0.3 }}
                        />
                      )}
                    </div>
                  )}
                  <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 ${cls}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="mt-3 text-center space-y-1 px-1">
                    <div className={`text-sm font-medium ${state === 'pending' ? 'text-text-muted' : 'text-text-primary'}`}>{node.name}</div>
                    <div className="text-xs text-text-muted flex items-center justify-center gap-1">
                      <User className="w-3 h-3" />{node.assigneeName}
                    </div>
                    <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                      state === 'done' ? 'bg-success/15 text-success' :
                      state === 'current' ? 'bg-primary/20 text-primary-light' :
                      state === 'escalated' ? 'bg-warning/15 text-warning' :
                      state === 'rejected' ? 'bg-danger/15 text-danger' :
                      'bg-bg-secondary text-text-muted'
                    }`}>
                      {state === 'done' ? '已完成' : state === 'current' ? '审批中' : state === 'escalated' ? '已升级' : state === 'rejected' ? '已驳回' : '待处理'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <h3 className="card-title mb-6 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-gradient-to-b from-accent to-warning" />
          审批轨迹
          <span className="ml-2 text-xs font-normal text-text-muted">({timeline.length} 条记录)</span>
        </h3>
        <div className="relative pl-8 space-y-5">
          <div className="absolute left-[15px] top-1 bottom-1 w-px bg-gradient-to-b from-primary/60 via-accent/30 to-transparent" />
          {timeline.map((item, i) => {
            const info = actionInfo[item.action];
            const Icon = info.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.03 * i }}
                className="relative"
              >
                <div className={`absolute -left-8 w-8 h-8 rounded-full flex items-center justify-center border-2 ${info.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {item.isTimeout && (
                  <div className="absolute -left-[30px] -top-1 z-10">
                    <div className="w-3 h-3 rounded-full bg-warning animate-ping" />
                  </div>
                )}
                <div className="glass-card p-4 ml-2 bg-gradient-to-br from-bg-secondary/40 to-transparent hover:border-primary/30 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`status-badge border ${info.color}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />{info.label}
                      </span>
                      <span className="text-text-primary font-medium flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-text-muted" />{item.operatorName}
                      </span>
                      <span className="text-text-muted text-xs">节点: {item.nodeName}</span>
                      {item.isTimeout && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/15 text-warning text-xs border border-warning/30">
                          <Clock className="w-3 h-3" />超时操作
                        </span>
                      )}
                    </div>
                    <span className="text-text-muted text-xs font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />{formatDateTime(item.timestamp)}
                    </span>
                  </div>
                  {item.comment && (
                    <div className="relative pl-3 border-l-2 border-primary/30 py-1">
                      <MessageSquare className="absolute -left-2 top-0 w-3 h-3 text-primary-light" />
                      <p className="text-text-secondary text-sm leading-relaxed">{item.comment}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {canAction && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6 relative overflow-hidden">
          <div className="absolute -bottom-16 right-10 w-48 h-48 rounded-full bg-success/5 blur-3xl" />
          <h3 className="card-title mb-4 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-gradient-to-b from-success to-primary" />
            审批操作
          </h3>
          <div className="space-y-4 relative">
            <div>
              <label className="block text-sm text-text-secondary mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-text-muted" />审批意见
              </label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                placeholder="请输入审批意见（选填）..."
                className="input-field resize-none"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => handleAction('reject')}
                disabled={!!actionLoading}
                className="btn-danger flex items-center gap-1.5 min-w-[120px] justify-center disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                {actionLoading === 'reject' ? '处理中...' : '驳回申请'}
              </button>
              <button
                onClick={() => handleAction('approve')}
                disabled={!!actionLoading}
                className="btn-success flex items-center gap-1.5 min-w-[120px] justify-center disabled:opacity-50 bg-success/20 text-success border-success/40 hover:bg-success/30 hover:shadow-glow-success"
              >
                <CheckCircle className="w-4 h-4" />
                {actionLoading === 'approve' ? '处理中...' : '通过审批'}
                <ChevronRight className="w-4 h-4 -mr-1" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

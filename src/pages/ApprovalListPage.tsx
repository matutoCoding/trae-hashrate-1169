import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ListTodo, Plus, Search, Filter, Calendar, ChevronDown, Eye, Bell, CheckCircle, XCircle,
  FileCheck, ArrowUpDown, Workflow,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAppStore } from '@/store/appStore';
import { formatDateTime } from '@/utils/dateUtils';
import type { ApprovalStatus, ApprovalRequest } from '@/types';

const statusTabs: { key: ApprovalStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '审批中' },
  { key: 'approved', label: '已通过' },
  { key: 'rejected', label: '已驳回' },
  { key: 'escalated', label: '已升级' },
];

export default function ApprovalListPage() {
  const nav = useNavigate();
  const { approvalRequests, approvalFlows, sendReminder, processApprovalAction } = useAppStore();
  const [statusTab, setStatusTab] = useState<ApprovalStatus | 'all'>('all');
  const [flowFilter, setFlowFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [flowDropdownOpen, setFlowDropdownOpen] = useState(false);

  const flowOptions = useMemo(() => [
    { key: 'all', label: '全部流程' },
    ...approvalFlows.map(f => ({ key: f.id, label: f.name })),
  ], [approvalFlows]);

  const filtered = useMemo(() => {
    return approvalRequests.filter(r => {
      if (statusTab !== 'all' && r.status !== statusTab) return false;
      if (flowFilter !== 'all' && r.flowId !== flowFilter) return false;
      if (dateFrom && r.submissionTime < dateFrom + 'T00:00:00') return false;
      if (dateTo && r.submissionTime > dateTo + 'T23:59:59') return false;
      if (searchText) {
        const s = searchText.toLowerCase();
        if (!r.id.toLowerCase().includes(s) && !r.slotTitle.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [approvalRequests, statusTab, flowFilter, dateFrom, dateTo, searchText]);

  const getProgress = (r: ApprovalRequest) => {
    const flow = approvalFlows.find(f => f.id === r.flowId);
    if (!flow) return { pct: 0, done: 0, total: 0 };
    const total = flow.nodes.length;
    const done = r.status === 'approved' ? total : Math.max(0, r.currentNodeOrder - 1);
    return { pct: total ? Math.round((done / total) * 100) : 0, done, total };
  };

  const getCurrentNodeInfo = (r: ApprovalRequest) => {
    const flow = approvalFlows.find(f => f.id === r.flowId);
    if (!flow) return { name: '-', assignee: '-' };
    if (r.status === 'approved') return { name: '全部完成', assignee: '-' };
    if (r.status === 'rejected') return { name: '已驳回', assignee: '-' };
    const node = flow.nodes.find(n => n.order === r.currentNodeOrder);
    return node ? { name: node.name, assignee: node.assigneeName } : { name: '-', assignee: '-' };
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(r => r.id)));
  };

  const handleAction = (e: React.MouseEvent, r: ApprovalRequest, action: 'remind' | 'approve' | 'reject') => {
    e.stopPropagation();
    if (action === 'remind') sendReminder(r.id);
    else processApprovalAction(r.id, action, action === 'approve' ? '列表快捷通过' : '列表快捷驳回');
  };

  const rowClick = (id: string) => nav(`/approval/${id}`);

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 relative overflow-hidden">
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-10 w-56 h-56 rounded-full bg-accent/5 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent/60 flex items-center justify-center shadow-glow-primary">
              <ListTodo className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="section-title m-0">报批申请列表</h1>
              <p className="text-text-muted text-sm mt-0.5">共 {filtered.length} 条审批记录</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/15 border border-accent/30 text-accent text-sm">
                已选 {selectedIds.size} 项
                <button className="ml-1 hover:text-white transition-colors" onClick={() => setSelectedIds(new Set())}>×</button>
              </div>
            )}
            <button className="btn-secondary flex items-center gap-1.5">
              <Workflow className="w-4 h-4" /> 批量导出
            </button>
            <button className="btn-primary flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> 新建报批
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-4 space-y-4">
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {statusTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusTab === tab.key
                  ? 'bg-primary/25 text-primary-light border border-primary/40 shadow-glow-primary'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 min-w-[200px]">
            <Filter className="w-4 h-4 text-text-muted shrink-0" />
            <div className="relative flex-1">
              <button
                onClick={() => setFlowDropdownOpen(!flowDropdownOpen)}
                className="w-full input-field flex items-center justify-between text-left"
              >
                <span className={flowFilter === 'all' ? 'text-text-muted' : ''}>
                  {flowOptions.find(o => o.key === flowFilter)?.label}
                </span>
                <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${flowDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {flowDropdownOpen && (
                <div className="absolute top-full mt-1 left-0 right-0 z-20 glass-card py-1 shadow-glow-primary overflow-hidden">
                  {flowOptions.map(o => (
                    <div
                      key={o.key}
                      onClick={() => { setFlowFilter(o.key); setFlowDropdownOpen(false); }}
                      className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                        flowFilter === o.key ? 'bg-primary/20 text-primary-light' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                      }`}
                    >
                      {o.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-text-muted shrink-0" />
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="input-field w-36"
              placeholder="起始日期"
            />
            <span className="text-text-muted">至</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="input-field w-36"
              placeholder="结束日期"
            />
          </div>
          <div className="flex-1 min-w-[220px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="搜索报批ID / 表演名称..."
              className="input-field pl-9"
            />
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-secondary/50">
                <th className="text-left px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 accent-primary"
                  />
                </th>
                {[
                  { k: 'id', label: '报批ID', icon: FileCheck, w: 'w-32' },
                  { k: 'title', label: '表演名称', icon: null, w: '' },
                  { k: 'flow', label: '审批流程', icon: Workflow, w: 'w-44' },
                  { k: 'node', label: '当前节点', icon: ArrowUpDown, w: 'w-40' },
                  { k: 'assignee', label: '审批人', w: 'w-28' },
                  { k: 'time', label: '提交时间', icon: Calendar, w: 'w-44' },
                  { k: 'progress', label: '进度', w: 'w-40' },
                  { k: 'status', label: '状态', w: 'w-24' },
                  { k: 'action', label: '操作', w: 'w-52' },
                ].map(col => (
                  <th key={col.k} className={`text-left px-4 py-3 font-medium text-text-secondary ${col.w || ''}`}>
                    <div className="flex items-center gap-1.5">
                      {col.icon && <col.icon className="w-3.5 h-3.5 text-text-muted" />}
                      {col.label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-20 text-center text-text-muted">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <div>暂无符合条件的报批记录</div>
                  </td>
                </tr>
              )}
              {filtered.map((r, i) => {
                const prog = getProgress(r);
                const cur = getCurrentNodeInfo(r);
                const checked = selectedIds.has(r.id);
                const canQuickAction = r.status === 'pending' || r.status === 'escalated';
                return (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.02 * i }}
                    onClick={() => rowClick(r.id)}
                    className={`border-b border-border-light cursor-pointer transition-colors ${
                      checked ? 'bg-primary/10' : 'hover:bg-bg-hover'
                    } last:border-0`}
                  >
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelect(r.id)}
                        className="w-4 h-4 accent-primary"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-text-secondary">{r.id}</td>
                    <td className="px-4 py-3 text-text-primary font-medium">{r.slotTitle}</td>
                    <td className="px-4 py-3 text-text-secondary">{r.flowName}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-primary-light">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-light animate-pulse" />
                        {cur.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{cur.assignee}</td>
                    <td className="px-4 py-3 text-text-muted font-mono text-xs">{formatDateTime(r.submissionTime)}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-text-muted">{prog.done}/{prog.total} 节点</span>
                          <span className="text-accent font-mono">{prog.pct}%</span>
                        </div>
                        <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              r.status === 'approved' ? 'bg-gradient-to-r from-success to-emerald-400'
                              : r.status === 'rejected' ? 'bg-gradient-to-r from-danger to-rose-400'
                              : 'bg-gradient-to-r from-primary to-accent shadow-glow-primary'
                            }`}
                            style={{ width: `${prog.pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge kind="approval" status={r.status} />
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => rowClick(r.id)}
                          className="p-1.5 rounded-lg text-text-secondary hover:text-primary-light hover:bg-primary/20 transition-all"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canQuickAction && (
                          <>
                            <button
                              onClick={e => handleAction(e, r, 'remind')}
                              className="p-1.5 rounded-lg text-text-secondary hover:text-warning hover:bg-warning/20 transition-all"
                              title="催办"
                            >
                              <Bell className="w-4 h-4" />
                            </button>
                            <button
                              onClick={e => handleAction(e, r, 'approve')}
                              className="p-1.5 rounded-lg text-text-secondary hover:text-success hover:bg-success/20 transition-all"
                              title="通过"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={e => handleAction(e, r, 'reject')}
                              className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/20 transition-all"
                              title="驳回"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

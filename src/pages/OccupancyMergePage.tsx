import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Merge, Building2, Plane, Clock, History, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { formatDateTime, formatTime, getMinutesBetween } from '@/utils/dateUtils';
import StatusBadge from '@/components/ui/StatusBadge';
import type { MergeCandidate } from '@/types';

const OccupancyMergePage: React.FC = () => {
  const {
    mergeCandidates,
    mergeLogs,
    recomputeMergeCandidates,
    mergeOccupancy,
  } = useAppStore();

  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    recomputeMergeCandidates();
  }, [recomputeMergeCandidates]);

  const handleRefresh = async () => {
    setRefreshing(true);
    recomputeMergeCandidates();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleMerge = (candidate: MergeCandidate) => {
    const remark = remarks[candidate.id] || '';
    const result = mergeOccupancy(candidate.id, remark);
    if (result.ok) {
      setToast({ type: 'success', msg: '合并成功' });
      setRemarks(prev => {
        const next = { ...prev };
        delete next[candidate.id];
        return next;
      });
    } else {
      setToast({ type: 'error', msg: result.message || '合并失败' });
    }
    setTimeout(() => setToast(null), 2500);
  };

  const sortedLogs = useMemo(
    () => [...mergeLogs].sort((a, b) => b.operationTime.localeCompare(a.operationTime)),
    [mergeLogs]
  );

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl glass-card border animate-fade-in-up"
          style={{ borderColor: toast.type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)' }}>
          {toast.type === 'success' ? <CheckCircle2 className="text-success" size={18} /> : <AlertCircle className="text-danger" size={18} />}
          <span className="text-sm font-medium">{toast.msg}</span>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="section-title flex items-center gap-3">
            <Merge className="text-primary-light" size={26} />
            占用合并
          </h1>
          <p className="text-text-muted text-sm mt-1">自动识别同主办方、同机阵的连续时段，合并为一个占用块</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          刷新候选
        </button>
      </div>

      {mergeCandidates.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="text-primary-light opacity-60" size={36} />
          </div>
          <div className="text-text-secondary font-medium mb-1">暂无可合并的候选</div>
          <div className="text-text-muted text-sm">所有可合并时段已处理完毕</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {mergeCandidates.map((c, idx) => (
            <CandidateCard
              key={c.id}
              candidate={c}
              index={idx}
              remark={remarks[c.id] || ''}
              onRemarkChange={(v) => setRemarks(prev => ({ ...prev, [c.id]: v }))}
              onMerge={() => handleMerge(c)}
            />
          ))}
        </div>
      )}

      <div className="mt-10">
        <h2 className="card-title flex items-center gap-2 mb-4">
          <History size={18} className="text-accent" />
          合并历史
        </h2>
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-secondary/60 text-text-muted text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-medium">操作时间</th>
                  <th className="px-5 py-3 text-left font-medium">合并结果ID</th>
                  <th className="px-5 py-3 text-left font-medium">来源数量</th>
                  <th className="px-5 py-3 text-left font-medium">操作人</th>
                  <th className="px-5 py-3 text-left font-medium">备注</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {sortedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-text-muted">暂无历史记录</td>
                  </tr>
                ) : sortedLogs.map(log => (
                  <tr key={log.id} className="hover:bg-bg-hover/50 transition-colors">
                    <td className="px-5 py-3 mono-text text-text-secondary">{formatDateTime(log.operationTime)}</td>
                    <td className="px-5 py-3 mono-text text-primary-light">{log.mergedOccupancyId}</td>
                    <td className="px-5 py-3">
                      <span className="status-badge border border-accent/40 bg-accent/10 text-accent">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {log.sourceOccupancyIds.length} 个
                      </span>
                    </td>
                    <td className="px-5 py-3 text-text-primary">{log.operatorName}</td>
                    <td className="px-5 py-3 text-text-muted max-w-xs truncate">{log.remark || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CandidateCardProps {
  candidate: MergeCandidate;
  index: number;
  remark: string;
  onRemarkChange: (v: string) => void;
  onMerge: () => void;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, index, remark, onRemarkChange, onMerge }) => {
  const totalMinutes = getMinutesBetween(candidate.startTime, candidate.endTime);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return (
    <div
      className="glass-card p-5 animate-fade-in-up relative overflow-hidden"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="relative space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-primary-light" />
              <span className="text-text-primary font-semibold">{candidate.organizerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Plane size={16} className="text-accent" />
              <span className="text-text-secondary">{candidate.fleetName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-warning" />
              <span className="text-text-secondary text-sm">
                {formatDateTime(candidate.startTime)} ~ {formatDateTime(candidate.endTime)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="status-badge border border-info/40 bg-info/10 text-info">
              <span className="w-1.5 h-1.5 rounded-full bg-info" />
              {candidate.slots.length} 个时段
            </span>
            <span className="status-badge border border-warning/40 bg-warning/10 text-warning">
              <span className="w-1.5 h-1.5 rounded-full bg-warning" />
              {hours > 0 ? `${hours}h` : ''}{mins > 0 ? `${mins}m` : ''} 总时长
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-text-muted font-medium">{formatTime(candidate.startTime)}</span>
            <span className="text-xs text-text-muted font-medium">{formatTime(candidate.endTime)}</span>
          </div>
          <div className="relative h-3 rounded-full bg-bg-secondary overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-primary-light to-accent animate-gradient-shift"
              style={{ width: '100%', backgroundSize: '200% 200%' }}
            />
            {candidate.slots.map((slot, i) => {
              if (i === 0) return null;
              const left = (getMinutesBetween(candidate.startTime, slot.startTime) / totalMinutes) * 100;
              return (
                <div
                  key={slot.id}
                  className="absolute top-0 bottom-0 w-0.5 bg-bg-primary/70"
                  style={{ left: `${left}%` }}
                />
              );
            })}
          </div>
        </div>

        <div className="grid gap-2">
          {candidate.slots.map(slot => (
            <div
              key={slot.id}
              className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-bg-secondary/60 border border-border-light hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-1 h-8 rounded-full bg-gradient-to-b from-primary-light to-accent" />
                <div className="min-w-0">
                  <div className="text-text-primary font-medium truncate">{slot.title}</div>
                  <div className="text-xs text-text-muted mt-0.5 mono-text">
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </div>
                </div>
              </div>
              <StatusBadge kind="slot" status={slot.status} />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-1">
          <input
            type="text"
            value={remark}
            onChange={(e) => onRemarkChange(e.target.value)}
            placeholder="合并备注（可选）..."
            className="input-field flex-1 min-w-[260px]"
          />
          <button onClick={onMerge} className="btn-primary flex items-center gap-2 min-w-[140px] justify-center">
            <Merge size={16} />
            执行合并
          </button>
        </div>
      </div>
    </div>
  );
};

export default OccupancyMergePage;

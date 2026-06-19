import React, { useState, useMemo } from 'react';
import { Scissors, Building2, Plane, Clock, History, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { formatDateTime, formatTime, getMinutesBetween, parseISO } from '@/utils/dateUtils';
import { buildSplitPointList } from '@/services/splitService';
import StatusBadge from '@/components/ui/StatusBadge';
import type { OccupancyBlock, PerformanceSlot } from '@/types';

const OccupancySplitPage: React.FC = () => {
  const { occupancies, slots, splitLogs, splitOccupancy } = useAppStore();

  const [selectedId, setSelectedId] = useState<string>('');
  const [splitPoint, setSplitPoint] = useState<string>('');
  const [reason, setReason] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeOccupancies = useMemo(
    () => occupancies.filter(o => o.status === 'active'),
    [occupancies]
  );

  const selected = useMemo(
    () => activeOccupancies.find(o => o.id === selectedId) || activeOccupancies[0],
    [activeOccupancies, selectedId]
  );

  const occSlots = useMemo(() => {
    if (!selected) return [];
    return slots.filter(s => selected.slotIds.includes(s.id))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [selected, slots]);

  const splitPoints = useMemo(() => {
    if (!selected) return [];
    return buildSplitPointList(selected, 30);
  }, [selected]);

  const preview = useMemo(() => {
    if (!selected || !splitPoint || occSlots.length === 0) return null;
    const point = parseISO(splitPoint).getTime();
    const beforeSlots: PerformanceSlot[] = [];
    const afterSlots: PerformanceSlot[] = [];
    for (const slot of occSlots) {
      const s = parseISO(slot.startTime).getTime();
      const e = parseISO(slot.endTime).getTime();
      if (e <= point) beforeSlots.push(slot);
      else if (s >= point) afterSlots.push(slot);
      else { beforeSlots.push(slot); afterSlots.push(slot); }
    }
    return {
      before: { start: selected.startTime, end: splitPoint, slots: beforeSlots },
      after: { start: splitPoint, end: selected.endTime, slots: afterSlots },
    };
  }, [selected, splitPoint, occSlots]);

  const canConfirm = splitPoint && reason.trim().length > 0;

  const handleConfirm = () => {
    if (!selected || !canConfirm) return;
    const result = splitOccupancy(selected.id, splitPoint, reason.trim());
    if (result.ok) {
      setToast({ type: 'success', msg: '拆分成功' });
      setSplitPoint('');
      setReason('');
    } else {
      setToast({ type: 'error', msg: result.message || '拆分失败' });
    }
    setTimeout(() => setToast(null), 2500);
  };

  const sortedLogs = useMemo(
    () => [...splitLogs].sort((a, b) => b.operationTime.localeCompare(a.operationTime)),
    [splitLogs]
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
            <Scissors className="text-accent" size={26} />
            占用拆分
          </h1>
          <p className="text-text-muted text-sm mt-1">选择一个活跃占用，在时间轴上选定拆分点，将其拆分为两个独立占用块</p>
        </div>
      </div>

      <div className="glass-card p-5 space-y-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(v => !v)}
              className="btn-secondary flex items-center gap-2 min-w-[360px] justify-between"
            >
              <span className="flex items-center gap-2">
                <Building2 size={15} className="text-primary-light" />
                {selected ? `${selected.organizerName} · ${selected.fleetName}` : '请选择占用记录'}
              </span>
              <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-full glass-card py-1 z-30 max-h-72 overflow-y-auto">
                {activeOccupancies.length === 0 ? (
                  <div className="px-4 py-6 text-center text-text-muted text-sm">暂无活跃占用</div>
                ) : activeOccupancies.map(o => (
                  <button
                    key={o.id}
                    onClick={() => { setSelectedId(o.id); setSplitPoint(''); setDropdownOpen(false); }}
                    className={`w-full px-4 py-3 text-left hover:bg-bg-hover transition-colors border-b border-border-light last:border-0 ${selectedId === o.id ? 'bg-primary/10' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-text-primary font-medium text-sm">{o.organizerName}</span>
                      <StatusBadge kind="occupancy" status={o.status} />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-text-secondary">{o.fleetName}</span>
                      <span className="mono-text text-xs text-text-muted">{formatTime(o.startTime)} - {formatTime(o.endTime)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {selected && (
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <Plane size={14} className="text-accent" /> {selected.fleetName}
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Clock size={14} className="text-warning" /> {formatDateTime(selected.startTime)} ~ {formatDateTime(selected.endTime)}
              </div>
              <StatusBadge kind="occupancy" status={selected.status} />
            </div>
          )}
        </div>

        {selected ? (
          <TimelineSection
            occupancy={selected}
            occSlots={occSlots}
            splitPoints={splitPoints}
            selectedPoint={splitPoint}
            onSelectPoint={setSplitPoint}
          />
        ) : (
          <div className="py-20 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-bg-secondary flex items-center justify-center">
              <Scissors className="text-text-muted opacity-40" size={36} />
            </div>
            <div className="text-text-muted">请从上方下拉选择一个活跃占用</div>
          </div>
        )}

        {preview && (
          <div className="grid md:grid-cols-2 gap-4 pt-2">
            <PreviewCard label="前半段" data={preview.before} splitAt={splitPoint} color="primary" />
            <PreviewCard label="后半段" data={preview.after} splitAt={splitPoint} color="accent" />
          </div>
        )}

        {selected && splitPoints.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border-light">
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="请输入拆分原因（必填）..."
              className="input-field flex-1 min-w-[280px]"
            />
            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              className={`btn-accent flex items-center gap-2 min-w-[140px] justify-center ${!canConfirm ? 'opacity-40 cursor-not-allowed active:scale-100' : ''}`}
            >
              <Scissors size={16} />
              确认拆分
            </button>
          </div>
        )}
      </div>

      <div className="mt-10">
        <h2 className="card-title flex items-center gap-2 mb-4">
          <History size={18} className="text-accent" />
          拆分历史
        </h2>
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-secondary/60 text-text-muted text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-medium">操作时间</th>
                  <th className="px-5 py-3 text-left font-medium">来源占用ID</th>
                  <th className="px-5 py-3 text-left font-medium">拆分点</th>
                  <th className="px-5 py-3 text-left font-medium">结果数量</th>
                  <th className="px-5 py-3 text-left font-medium">操作人</th>
                  <th className="px-5 py-3 text-left font-medium">拆分原因</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {sortedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-text-muted">暂无历史记录</td>
                  </tr>
                ) : sortedLogs.map(log => (
                  <tr key={log.id} className="hover:bg-bg-hover/50 transition-colors">
                    <td className="px-5 py-3 mono-text text-text-secondary">{formatDateTime(log.operationTime)}</td>
                    <td className="px-5 py-3 mono-text text-warning">{log.sourceOccupancyId}</td>
                    <td className="px-5 py-3 mono-text text-text-primary">{formatDateTime(log.splitPoint)}</td>
                    <td className="px-5 py-3">
                      <span className="status-badge border border-accent/40 bg-accent/10 text-accent">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {log.resultOccupancyIds.length} 个
                      </span>
                    </td>
                    <td className="px-5 py-3 text-text-primary">{log.operatorName}</td>
                    <td className="px-5 py-3 text-text-muted max-w-xs truncate">{log.reason || '-'}</td>
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

interface TimelineSectionProps {
  occupancy: OccupancyBlock;
  occSlots: PerformanceSlot[];
  splitPoints: { value: string; label: string }[];
  selectedPoint: string;
  onSelectPoint: (v: string) => void;
}

const TimelineSection: React.FC<TimelineSectionProps> = ({ occupancy, occSlots, splitPoints, selectedPoint, onSelectPoint }) => {
  const totalMins = getMinutesBetween(occupancy.startTime, occupancy.endTime);
  const pointTime = parseISO(occupancy.startTime).getTime();
  const markers = useMemo(() => {
    return occSlots.map(s => ({
      id: s.id,
      left: (getMinutesBetween(occupancy.startTime, s.startTime) / totalMins) * 100,
      width: (getMinutesBetween(s.startTime, s.endTime) / totalMins) * 100,
      slot: s,
    }));
  }, [occupancy, occSlots, totalMins]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-medium text-text-muted">{formatDateTime(occupancy.startTime)}</span>
        <span className="text-xs font-medium text-accent">每 30 分钟一个候选拆分点（可点击）</span>
        <span className="text-xs font-medium text-text-muted">{formatDateTime(occupancy.endTime)}</span>
      </div>

      <div className="relative h-14 rounded-xl bg-bg-secondary overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary-light to-accent animate-gradient-shift"
          style={{ width: '100%', backgroundSize: '200% 200%' }}
        />
        {markers.map((m, i) => (
          i > 0 ? (
            <div
              key={`sep-${m.id}`}
              className="absolute top-0 bottom-0 border-l-2 border-dashed border-bg-primary/80 z-10"
              style={{ left: `${m.left}%` }}
            />
          ) : null
        ))}
        {selectedPoint && (
          <div
            className="absolute top-0 bottom-0 border-l-2 border-warning z-20 shadow-glow-warning"
            style={{ left: `${((parseISO(selectedPoint).getTime() - pointTime) / (totalMins * 60000)) * 100}%` }}
          >
            <div className="absolute -top-1 -left-2 w-4 h-4 rounded-full bg-warning shadow-glow-warning" />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap mono-text text-xs bg-warning/20 text-warning px-2 py-0.5 rounded border border-warning/40">
              {formatTime(selectedPoint)}
            </div>
          </div>
        )}
      </div>

      {splitPoints.length > 0 ? (
        <div className="relative pt-2">
          <div className="relative h-10 flex items-center">
            <div className="absolute left-0 right-0 h-px bg-border" />
            {splitPoints.map(p => {
              const left = ((parseISO(p.value).getTime() - pointTime) / (totalMins * 60000)) * 100;
              const isSelected = selectedPoint === p.value;
              return (
                <button
                  key={p.value}
                  onClick={() => onSelectPoint(isSelected ? '' : p.value)}
                  className="absolute -translate-x-1/2 group"
                  style={{ left: `${left}%` }}
                  title={p.label}
                >
                  <span className={`block w-3 h-3 rounded-full transition-all ${isSelected
                    ? 'bg-warning scale-150 shadow-glow-warning'
                    : 'bg-bg-secondary border border-primary/50 hover:border-accent hover:bg-accent/40 group-hover:scale-125'
                  }`} />
                  <span className={`absolute top-4 left-1/2 -translate-x-1/2 text-[10px] mono-text whitespace-nowrap transition-opacity ${isSelected ? 'text-warning opacity-100' : 'text-text-muted opacity-0 group-hover:opacity-100'}`}>
                    {formatTime(p.value)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center text-text-muted text-sm py-3">该占用时段不足 1 小时，无可选拆分点</div>
      )}
    </div>
  );
};

interface PreviewData {
  start: string;
  end: string;
  slots: PerformanceSlot[];
}

interface PreviewCardProps {
  label: string;
  data: PreviewData;
  splitAt: string;
  color: 'primary' | 'accent';
}

const PreviewCard: React.FC<PreviewCardProps> = ({ label, data, splitAt, color }) => {
  const colorCls = color === 'primary'
    ? 'from-primary/15 to-primary/5 border-primary/40 text-primary-light'
    : 'from-accent/15 to-accent/5 border-accent/40 text-accent';
  const mins = getMinutesBetween(data.start, data.end);
  const h = Math.floor(mins / 60);
  const m = mins % 60;

  return (
    <div className={`glass-card p-4 bg-gradient-to-br ${colorCls}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-display font-semibold text-text-primary">{label}</span>
        <span className="status-badge border border-current/40 bg-current/10 text-current">
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {h > 0 ? `${h}h` : ''}{m > 0 ? `${m}m` : ''}
        </span>
      </div>
      <div className="mono-text text-xs text-text-muted mb-3 bg-bg-secondary/60 px-3 py-2 rounded-lg border border-border-light">
        {formatDateTime(data.start)} ~ {formatDateTime(data.end)}
        {data.slots.some(s => {
          const p = parseISO(splitAt).getTime();
          const ss = parseISO(s.startTime).getTime();
          const ee = parseISO(s.endTime).getTime();
          return p > ss && p < ee;
        }) && (
          <span className="ml-2 text-warning">（含被分割的 slot）</span>
        )}
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {data.slots.map(s => (
          <div key={s.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-bg-secondary/70 border border-border-light">
            <div className="min-w-0">
              <div className="text-sm text-text-primary truncate">{s.title}</div>
              <div className="mono-text text-[11px] text-text-muted">{formatTime(s.startTime)} - {formatTime(s.endTime)}</div>
            </div>
            <StatusBadge kind="slot" status={s.status} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OccupancySplitPage;

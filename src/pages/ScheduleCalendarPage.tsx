import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Plus, ChevronLeft, ChevronRight, Filter,
  CalendarIcon, LayoutGrid, Users, Clock, Info,
} from 'lucide-react';
import {
  format, isSameDay, parseISO, startOfWeek, addDays,
  addWeeks, eachDayOfInterval, differenceInMinutes,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { PerformanceSlot, SlotStatus } from '@/types';
import { mockSlots, mockOccupancies, mockOrganizers, mockFleets } from '@/data/mockData';
import { slotStatusMap } from '@/utils/formatters';

type ViewMode = 'week' | 'month';

const SG: Record<SlotStatus, string> = {
  draft: 'from-slate-500/40 via-slate-600/40',
  confirmed: 'from-blue-500/50 via-indigo-500/40',
  approved: 'from-emerald-500/50 via-teal-500/40',
  completed: 'from-violet-500/50 via-purple-500/40',
  cancelled: 'from-rose-500/50 via-red-500/40',
};
const SB: Record<SlotStatus, string> = {
  draft: 'border-slate-400/60', confirmed: 'border-blue-400/60',
  approved: 'border-emerald-400/60', completed: 'border-violet-400/60',
  cancelled: 'border-rose-400/60',
};
const TS = Array.from({ length: 32 }, (_, i) =>
  `${String(Math.floor(i / 2) + 8).padStart(2, '0')}:${String((i % 2) * 30).padStart(2, '0')}`
);
const WK = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export default function ScheduleCalendarPage() {
  const nav = useNavigate();
  const [vm, setVm] = useState<ViewMode>('week');
  const [cd, setCd] = useState(new Date());
  const [f, setF] = useState({ org: '', fleet: '', st: '' as SlotStatus | '' });
  const [hv, setHv] = useState<string | null>(null);

  const wd = useMemo(() => {
    const s = startOfWeek(cd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: s, end: addDays(s, 6) });
  }, [cd]);

  const merged = useMemo(() => {
    const s = new Set<string>();
    mockOccupancies.forEach(o => { if (o.isMerged) o.slotIds.forEach(id => s.add(id)); });
    return s;
  }, []);

  const slots = useMemo(() =>
    mockSlots.filter(sl =>
      (!f.org || sl.organizerId === f.org) &&
      (!f.fleet || sl.fleetId === f.fleet) &&
      (!f.st || sl.status === f.st)
    ), [f]);

  const byDay = useMemo(() => {
    const m: Record<string, PerformanceSlot[]> = {};
    wd.forEach(d => { m[format(d, 'yyyy-MM-dd')] = []; });
    slots.forEach(sl => {
      const k = format(parseISO(sl.startTime), 'yyyy-MM-dd');
      if (m[k]) m[k].push(sl);
    });
    return m;
  }, [wd, slots]);

  const pos = (st: string, et: string) => {
    const s = parseISO(st), e = parseISO(et);
    const sm = (s.getHours() - 8) * 60 + s.getMinutes();
    const d = differenceInMinutes(e, s);
    return { t: (sm / 30) * 48, h: (d / 30) * 48 };
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="section-title flex items-center gap-3">
            <Calendar className="w-7 h-7 text-primary-light" /> 排期日历
          </h1>
          <p className="text-text-secondary text-sm mt-1">管理无人机表演时段排期</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> 新建时段
        </button>
      </div>

      <div className="glass-card p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Filter className="w-4 h-4 text-text-muted" /> 筛选：
          </div>
          <select className="input-field w-48" value={f.org} onChange={e => setF({ ...f, org: e.target.value })}>
            <option value="">全部主办方</option>
            {mockOrganizers.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <select className="input-field w-48" value={f.fleet} onChange={e => setF({ ...f, fleet: e.target.value })}>
            <option value="">全部机阵</option>
            {mockFleets.map(fl => <option key={fl.id} value={fl.id}>{fl.name}</option>)}
          </select>
          <select className="input-field w-36" value={f.st} onChange={e => setF({ ...f, st: e.target.value as SlotStatus | '' })}>
            <option value="">全部状态</option>
            {Object.entries(slotStatusMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          {(f.org || f.fleet || f.st) && (
            <button onClick={() => setF({ org: '', fleet: '', st: '' })} className="text-sm text-primary-light hover:underline">
              清除筛选
            </button>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setCd(addWeeks(cd, -1))} className="btn-secondary p-2"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setCd(new Date())} className="btn-secondary text-sm">今天</button>
            <button onClick={() => setCd(addWeeks(cd, 1))} className="btn-secondary p-2"><ChevronRight className="w-4 h-4" /></button>
            <span className="ml-4 font-display text-lg font-semibold">
              {format(wd[0], 'yyyy年MM月dd日', { locale: zhCN })} - {format(wd[6], 'MM月dd日', { locale: zhCN })}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-bg-secondary rounded-lg p-1 border border-border">
            {(['week', 'month'] as ViewMode[]).map(m => (
              <button key={m} onClick={() => setVm(m)}
                className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition-all ${
                  vm === m ? 'bg-primary text-white shadow-glow-primary' : 'text-text-secondary hover:text-text-primary'
                }`}>
                {m === 'week' ? <LayoutGrid className="w-4 h-4" /> : <CalendarIcon className="w-4 h-4" />}
                {m === 'week' ? '周视图' : '月视图'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-4 overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-px mb-2">
            <div />
            {wd.map((d, i) => {
              const t = isSameDay(d, new Date());
              return (
                <div key={i} className={`text-center py-3 rounded-lg border border-border bg-bg-secondary/50 ${t ? 'ring-2 ring-primary/50 bg-primary/10' : ''}`}>
                  <div className="text-xs text-text-muted mb-1">{WK[i]}</div>
                  <div className={`font-display text-xl font-bold ${t ? 'text-primary-light' : ''}`}>{format(d, 'dd')}</div>
                  <div className="text-xs text-text-muted">{format(d, 'MM月', { locale: zhCN })}</div>
                </div>
              );
            })}
          </div>
          <div className="relative grid grid-cols-[80px_repeat(7,1fr)] gap-px">
            <div>
              {TS.map((t, i) => (
                <div key={t} className="h-12 flex items-start justify-end pr-3 text-xs text-text-muted font-mono">
                  {i % 2 === 0 ? t : ''}
                </div>
              ))}
            </div>
            {wd.map((d, di) => {
              const dk = format(d, 'yyyy-MM-dd');
              const ds = byDay[dk] || [];
              return (
                <div key={di} className="relative border-l border-border">
                  {TS.map((_, i) => <div key={i} className="h-12 border-b border-border-light" />)}
                  <AnimatePresence>
                    {ds.map(sl => {
                      const p = pos(sl.startTime, sl.endTime);
                      const mg = merged.has(sl.id);
                      return (
                        <motion.button key={sl.id}
                          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.02 }} onClick={() => nav(`/schedule/${sl.id}`)}
                          onMouseEnter={() => setHv(sl.id)} onMouseLeave={() => setHv(null)}
                          style={{ top: `${p.t}px`, height: `${p.h}px` }}
                          className={`absolute left-1 right-1 rounded-lg overflow-hidden cursor-pointer
                            bg-gradient-to-br ${SG[sl.status]} border ${SB[sl.status]} backdrop-blur-sm
                            ${mg ? 'border-2 border-double shadow-lg' : ''}
                            hover:shadow-glow-primary transition-shadow duration-200`}>
                          <div className="h-full p-2 flex flex-col justify-between text-left">
                            <div>
                              <div className="text-xs font-semibold text-white truncate">{sl.title}</div>
                              <div className="text-[10px] text-white/80 truncate flex items-center gap-1 mt-0.5">
                                <Users className="w-3 h-3" /> {sl.organizerName}
                              </div>
                            </div>
                            <div className="text-[10px] text-white/70 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(parseISO(sl.startTime), 'HH:mm')} - {format(parseISO(sl.endTime), 'HH:mm')}
                            </div>
                          </div>
                          {hv === sl.id && <div className="absolute inset-0 bg-black/20" />}
                          {mg && <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white/80 shadow" />}
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-6 flex-wrap">
          <span className="text-sm text-text-secondary flex items-center gap-2"><Info className="w-4 h-4" />图例：</span>
          {Object.entries(slotStatusMap).map(([s, i]) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded bg-gradient-to-br ${SG[s as SlotStatus]} border ${SB[s as SlotStatus]}`} />
              <span className="text-sm text-text-secondary">{i.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-double border-primary-light bg-primary/30" />
            <span className="text-sm text-text-secondary">合并占用</span>
          </div>
        </div>
      </div>
    </div>
  );
}

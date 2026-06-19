import React, { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import type { AirspaceReport, AviationStatus } from '@/types';
import { aviationStatusMap } from '@/utils/formatters';
import StatusBadge from '@/components/ui/StatusBadge';
import { Plus, Eye, Send, FileText, ChevronDown, ChevronUp, MapPin, File, Radar, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const CoordPolygon: React.FC<{ coords: AirspaceReport['coordinates']; size?: number }> = ({ coords, size = 120 }) => {
  if (!coords.length) return null;
  const lats = coords.map(c => c.lat), lngs = coords.map(c => c.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const pad = size * 0.1;
  const scale = (v: number, min: number, max: number) => pad + ((v - min) / (max - min || 1)) * (size - pad * 2);
  const points = coords.map(c => `${scale(c.lng, minLng, maxLng)},${scale(c.lat, maxLat, minLat)}`).join(' ');
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="bg-bg-secondary/50 rounded-lg border border-border-light">
      <defs>
        <linearGradient id="polyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(59,130,246,0.3)" />
          <stop offset="100%" stopColor="rgba(6,182,212,0.3)" />
        </linearGradient>
      </defs>
      {[...Array(5)].map((_, i) => (
        <line key={`h${i}`} x1="0" y1={(size / 5) * i} x2={size} y2={(size / 5) * i} stroke="rgba(148,163,184,0.08)" strokeWidth="1" />
      ))}
      {[...Array(5)].map((_, i) => (
        <line key={`v${i}`} x1={(size / 5) * i} y1="0" x2={(size / 5) * i} y2={size} stroke="rgba(148,163,184,0.08)" strokeWidth="1" />
      ))}
      <polygon points={points} fill="url(#polyGrad)" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round" />
      {coords.map((_, i) => {
        const xy = points.split(' ')[i].split(',');
        return <circle key={i} cx={Number(xy[0])} cy={Number(xy[1])} r="3" fill="#06B6D4" />;
      })}
    </svg>
  );
};

type FilterValue = 'all' | AviationStatus;

const AirspaceReportPage: React.FC = () => {
  const { airspaceReports } = useAppStore();
  const [civilFilter, setCivilFilter] = useState<FilterValue>('all');
  const [milFilter, setMilFilter] = useState<FilterValue>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = airspaceReports.filter(r =>
    (civilFilter === 'all' || r.civilAviationStatus === civilFilter) &&
    (milFilter === 'all' || r.militaryAviationStatus === milFilter)
  );

  const createReport = () => {
    const nr: AirspaceReport = {
      id: `air_${Date.now()}`, slotId: '', slotTitle: '新建报备',
      coordinates: [{ lat: 39.9, lng: 116.4 }, { lat: 39.91, lng: 116.42 }, { lat: 39.89, lng: 116.41 }],
      altitudeRange: { min: 100, max: 300 }, civilAviationStatus: 'pending', militaryAviationStatus: 'pending',
      documents: [], createdAt: new Date().toISOString(),
    };
    useAppStore.setState({ airspaceReports: [...airspaceReports, nr] });
    setExpandedId(nr.id);
  };

  const submitReport = (id: string) => {
    useAppStore.setState({ airspaceReports: airspaceReports.map(r => r.id === id ? { ...r, civilAviationStatus: 'submitted' as AviationStatus } : r) });
  };

  const FilterSelect: React.FC<{ label: string; value: FilterValue; onChange: (v: FilterValue) => void }> = ({ label, value, onChange }) => (
    <label className="flex items-center gap-2">
      <span className="text-sm text-text-muted whitespace-nowrap">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value as FilterValue)} className="input-field text-sm !py-1.5 !w-36">
        <option value="all">全部状态</option>
        {Object.entries(aviationStatusMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
      </select>
    </label>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="page-header flex-wrap gap-4">
        <div>
          <h1 className="section-title flex items-center gap-3"><Radar className="text-accent" size={28} />空域报备管理</h1>
          <p className="text-text-muted text-sm mt-1">共 {airspaceReports.length} 条报备记录 · 筛选结果 {filtered.length} 条</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <FilterSelect label="民航状态" value={civilFilter} onChange={setCivilFilter} />
          <FilterSelect label="军航状态" value={milFilter} onChange={setMilFilter} />
          <button onClick={createReport} className="btn-primary flex items-center gap-2"><Plus size={18} />新建报备</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((r, i) => {
          const expanded = expandedId === r.id;
          return (
            <div key={r.id} className={`glass-card overflow-hidden transition-all duration-300 ${expanded ? 'border-accent/50 shadow-glow-accent/30' : 'hover:border-primary/30'}`} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="p-5 cursor-pointer" onClick={() => setExpandedId(expanded ? null : r.id)}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-text-primary truncate">{r.slotTitle}</h3>
                    {r.reportNumber && <p className="text-xs text-text-muted font-mono mt-0.5">#{r.reportNumber}</p>}
                  </div>
                  {expanded ? <ChevronUp size={20} className="text-accent flex-shrink-0" /> : <ChevronDown size={20} className="text-text-muted flex-shrink-0" />}
                </div>
                <div className="flex gap-4">
                  <CoordPolygon coords={r.coordinates} size={100} />
                  <div className="flex-1 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                      <MapPin size={14} className="text-primary-light" />
                      <span className="font-mono">{r.altitudeRange.min} - {r.altitudeRange.max} m</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <StatusBadge kind="aviation" status={r.civilAviationStatus} />
                      <StatusBadge kind="aviation" status={r.militaryAviationStatus} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span className="flex items-center gap-1"><File size={12} className="text-info" />{r.documents.length} 个附件</span>
                      <span className="flex items-center gap-1"><Calendar size={12} />{format(new Date(r.createdAt), 'MM-dd HH:mm', { locale: zhCN })}</span>
                    </div>
                  </div>
                </div>
                {!expanded && (
                  <div className="flex gap-2 mt-4 pt-3 border-t border-border-light">
                    <button onClick={e => { e.stopPropagation(); setExpandedId(r.id); }} className="flex-1 btn-secondary flex items-center justify-center gap-1.5 text-sm !py-1.5"><Eye size={14} />查看详情</button>
                    <button onClick={e => { e.stopPropagation(); submitReport(r.id); }} className="flex-1 btn-accent flex items-center justify-center gap-1.5 text-sm !py-1.5"><Send size={14} />提交报备</button>
                  </div>
                )}
              </div>
              {expanded && (
                <div className="border-t border-border-light p-5 space-y-4 bg-bg-secondary/30">
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2"><MapPin size={14} className="text-primary-light" />坐标列表</h4>
                    <div className="grid grid-cols-2 gap-1.5">
                      {r.coordinates.map((c, i) => (
                        <div key={i} className="text-xs font-mono px-2 py-1.5 rounded-lg bg-bg-secondary border border-border-light text-text-secondary">
                          <span className="text-primary-light mr-1">{i + 1}.</span>
                          {c.lat.toFixed(4)}, {c.lng.toFixed(4)}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2"><FileText size={14} className="text-info" />文件列表</h4>
                    {r.documents.length ? (
                      <div className="space-y-1.5">
                        {r.documents.map((d, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-secondary border border-border-light hover:border-primary/40 transition-colors cursor-pointer">
                            <File size={14} className={d.type === 'pdf' ? 'text-danger' : 'text-primary-light'} />
                            <span className="text-sm text-text-secondary flex-1 truncate">{d.name}</span>
                            <span className="text-xs text-text-muted font-mono uppercase">{d.type}</span>
                          </div>
                        ))}
                      </div>
                    ) : <div className="text-xs text-text-muted text-center py-4 bg-bg-secondary/50 rounded-lg border border-dashed border-border-light">暂无附件</div>}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 btn-secondary flex items-center justify-center gap-1.5 text-sm"><Eye size={14} />查看详情</button>
                    <button onClick={() => submitReport(r.id)} className="flex-1 btn-accent flex items-center justify-center gap-1.5 text-sm"><Send size={14} />提交报备</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AirspaceReportPage;

import React from 'react';
import { useAppStore } from '@/store/appStore';
import { formatNumber } from '@/utils/formatters';
import StatusBadge from '@/components/ui/StatusBadge';
import { Plus, Wrench, Eye, MapPin, Mountain, Timer, Cpu } from 'lucide-react';

const DroneIcon: React.FC<{ color?: string }> = ({ color = '#3B82F6' }) => (
  <svg viewBox="0 0 64 64" className="w-20 h-20" fill="none" stroke={color} strokeWidth="1.5">
    <circle cx="14" cy="14" r="10" strokeDasharray="3 2" />
    <circle cx="50" cy="14" r="10" strokeDasharray="3 2" />
    <circle cx="14" cy="50" r="10" strokeDasharray="3 2" />
    <circle cx="50" cy="50" r="10" strokeDasharray="3 2" />
    <line x1="20" y1="20" x2="28" y2="28" />
    <line x1="44" y1="20" x2="36" y2="28" />
    <line x1="20" y1="44" x2="28" y2="36" />
    <line x1="44" y1="44" x2="36" y2="36" />
    <rect x="24" y="24" width="16" height="16" rx="3" />
    <circle cx="32" cy="32" r="3" fill={color} />
  </svg>
);

const ProgressRing: React.FC<{ value: number; max: number }> = ({ value, max }) => {
  const pct = Math.min(100, (value / max) * 100);
  const r = 28, c = 2 * Math.PI * r;
  const stroke = pct > 80 ? '#10B981' : pct > 50 ? '#06B6D4' : '#F97316';
  return (
    <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
      <circle cx="32" cy="32" r={r} stroke="rgba(148,163,184,0.15)" strokeWidth="5" fill="none" />
      <circle cx="32" cy="32" r={r} stroke={stroke} strokeWidth="5" fill="none"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} strokeLinecap="round" />
    </svg>
  );
};

const FleetManagementPage: React.FC = () => {
  const { fleets } = useAppStore();
  const maxCount = 3000;

  return (
    <div className="p-6 space-y-6">
      <div className="page-header">
        <div>
          <h1 className="section-title">机阵管理</h1>
          <p className="text-text-muted text-sm mt-1">共 {fleets.length} 个机阵编队</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} /> 新增机阵
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {fleets.map((f, i) => (
          <div key={f.id} className="glass-card p-5 hover:border-primary/40 hover:shadow-glow-primary/30 transition-all cursor-pointer group"
            style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <DroneIcon color={f.status === 'available' ? '#10B981' : f.status === 'in_use' ? '#06B6D4' : '#F97316'} />
                  {f.status === 'in_use' && <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-accent animate-ping" />}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-text-primary group-hover:text-primary-light transition-colors">{f.name}</h3>
                  <StatusBadge kind="fleet" status={f.status} />
                </div>
              </div>
              <div className="relative">
                <ProgressRing value={f.droneCount} max={maxCount} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display font-bold text-sm text-text-primary">{formatNumber(f.droneCount)}</span>
                  <span className="text-[10px] text-text-muted">规模</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4 py-3 border-y border-border-light">
              <div className="text-center">
                <Cpu size={14} className="mx-auto mb-1 text-primary-light" />
                <div className="text-xs text-text-muted">型号</div>
                <div className="text-sm font-mono text-text-secondary truncate" title={f.droneModel}>{f.droneModel.slice(0, 8)}..</div>
              </div>
              <div className="text-center">
                <Mountain size={14} className="mx-auto mb-1 text-accent" />
                <div className="text-xs text-text-muted">高度</div>
                <div className="text-sm font-mono text-text-secondary">{f.maxAltitude}m</div>
              </div>
              <div className="text-center">
                <Timer size={14} className="mx-auto mb-1 text-warning" />
                <div className="text-xs text-text-muted">航时</div>
                <div className="text-sm font-mono text-text-secondary">{f.maxFlightTime}min</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <MapPin size={13} className="text-primary-light/70" />
                {f.location}
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-warning/10 text-warning hover:bg-warning/20 transition-colors" title="维护">
                  <Wrench size={15} />
                </button>
                <button className="p-2 rounded-lg bg-primary/10 text-primary-light hover:bg-primary/20 transition-colors" title="详情">
                  <Eye size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FleetManagementPage;

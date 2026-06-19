import React from 'react';
import { useAppStore } from '@/store/appStore';
import { formatNumber } from '@/utils/formatters';
import KpiCard from '@/components/ui/KpiCard';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar,
} from 'recharts';
import { Calendar, Clock, AlertTriangle, Activity } from 'lucide-react';

const COLORS = ['#3B82F6', '#06B6D4', '#10B981', '#8B5CF6', '#F97316', '#EF4444'];

const DashboardPage: React.FC = () => {
  const { dashboardStats } = useAppStore();
  const { todayPerformances, pendingApprovals, timeoutWarnings, fleetUtilization,
    weeklyTrend, statusDistribution, fleetRadarData, todaySchedule } = dashboardStats;

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="今日表演数" value={todayPerformances} icon={Calendar} color="primary" suffix="场" trend={12} delay={0} />
        <KpiCard title="待审批数" value={pendingApprovals} icon={Clock} color="accent" suffix="单" trend={-5} delay={0.1} />
        <KpiCard title="超时预警" value={timeoutWarnings} icon={AlertTriangle} color="warning" suffix="个" delay={0.2} />
        <KpiCard title="机阵利用率" value={fleetUtilization} icon={Activity} color="success" isPercent trend={8} delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-5">
          <h3 className="card-title mb-4">周表演趋势</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip contentStyle={{ background: '#0F1F38', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 8, color: '#F1F5F9' }} />
              <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="card-title mb-4">状态分布</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
                {statusDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0F1F38', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 8, color: '#F1F5F9' }} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94A3B8' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="card-title mb-4">机阵利用率</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={fleetRadarData}>
              <PolarGrid stroke="rgba(148,163,184,0.15)" />
              <PolarAngleAxis dataKey="subject" stroke="#64748B" fontSize={11} />
              <PolarRadiusAxis stroke="#64748B" fontSize={10} />
              <Radar name="利用率" dataKey="value" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.35} />
              <Tooltip contentStyle={{ background: '#0F1F38', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 8, color: '#F1F5F9' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="card-title mb-4">今日排期</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {todaySchedule.map((item, i) => (
            <div key={i} className="glass-card p-4 bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-accent/15 text-accent text-xs font-mono font-medium">{item.time}</span>
                  <StatusBadge kind="slot" status={item.status} />
                </div>
              </div>
              <div className="font-medium text-text-primary mb-1 group-hover:text-primary-light transition-colors">{item.title}</div>
              <div className="text-xs text-text-muted flex items-center gap-1.5">
                <Activity size={12} />
                {item.organizer}
                <span className="mx-2 text-border">|</span>
                <Calendar size={12} />
                {formatNumber(50000)}人
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

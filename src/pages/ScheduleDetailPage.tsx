import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Edit3, Trash2, Copy, Send, CheckCircle, XCircle,
  Users, Plane, MapPin, Users as UsersIcon, FileText, Calendar as Cal,
  Clock, AlertCircle, Cloud, Radar,
} from 'lucide-react';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import StatusBadge from '@/components/ui/StatusBadge';
import type { PerformanceSlot } from '@/types';
import { mockSlots, mockAirspaceReports } from '@/data/mockData';
import { formatDateTime, formatDuration } from '@/utils/dateUtils';
import { formatNumber } from '@/utils/formatters';

const Card: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; glow?: string }> = ({ icon, title, children, glow }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className={`glass-card p-5 relative overflow-hidden ${glow ? glow : ''}`}
  >
    <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/5 blur-3xl" />
    <div className="relative">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center text-primary-light border border-primary/30">
          {icon}
        </div>
        <h3 className="card-title">{title}</h3>
      </div>
      {children}
    </div>
  </motion.div>
);

const Row: React.FC<{ label: string; value: React.ReactNode; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="flex items-start py-2 border-b border-border-light last:border-0">
    <span className="w-28 shrink-0 text-text-muted text-sm">{label}</span>
    <span className={`text-text-primary ${mono ? 'font-mono text-sm' : ''}`}>{value}</span>
  </div>
);

export default function ScheduleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const slot = useMemo<PerformanceSlot | undefined>(() =>
    mockSlots.find(s => s.id === id), [id]);

  const airReport = useMemo(() =>
    mockAirspaceReports.find(r => r.slotId === id), [id]);

  if (!slot) {
    return (
      <div className="p-6">
        <button onClick={() => nav(-1)} className="btn-secondary mb-6 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> 返回
        </button>
        <div className="glass-card p-16 text-center">
          <AlertCircle className="w-16 h-16 text-warning mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">时段不存在</h2>
          <p className="text-text-secondary">未找到ID为 <span className="font-mono">{id}</span> 的排期记录</p>
        </div>
      </div>
    );
  }

  const dur = formatDuration(differenceInMinutes(parseISO(slot.endTime), parseISO(slot.startTime)));
  const sH = parseISO(slot.startTime).getHours() + parseISO(slot.startTime).getMinutes() / 60;
  const eH = parseISO(slot.endTime).getHours() + parseISO(slot.endTime).getMinutes() / 60;
  const leftPct = ((sH - 8) / 16) * 100;
  const widthPct = ((eH - sH) / 16) * 100;

  const statusColor = {
    draft: 'from-slate-500 to-slate-700',
    confirmed: 'from-blue-500 to-indigo-600',
    approved: 'from-emerald-500 to-teal-600',
    completed: 'from-violet-500 to-purple-600',
    cancelled: 'from-rose-500 to-red-600',
  }[slot.status];

  return (
    <div className="p-6 space-y-6">
      <div className="glass-card p-5 relative overflow-hidden">
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${statusColor}`} />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <button onClick={() => nav(-1)} className="btn-secondary p-2 mt-1 shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="section-title m-0">{slot.title}</h1>
                <StatusBadge kind="slot" status={slot.status} />
              </div>
              <p className="text-text-secondary text-sm flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5"><Cal className="w-4 h-4 text-text-muted" />ID: <span className="font-mono">{slot.id}</span></span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-text-muted" />创建于 {formatDateTime(slot.createdAt)}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {slot.status === 'draft' && (
              <button className="btn-accent flex items-center gap-1.5">
                <Send className="w-4 h-4" /> 提交审批
              </button>
            )}
            {slot.status === 'approved' && (
              <button className="btn-success flex items-center gap-1.5 bg-success/20 text-success border-success/40 hover:bg-success/30 hover:shadow-glow-success px-4 py-2 rounded-lg transition-all active:scale-95">
                <CheckCircle className="w-4 h-4" /> 标记完成
              </button>
            )}
            {slot.status !== 'completed' && slot.status !== 'cancelled' && (
              <button className="btn-danger flex items-center gap-1.5">
                <XCircle className="w-4 h-4" /> 取消
              </button>
            )}
            <button className="btn-secondary flex items-center gap-1.5">
              <Copy className="w-4 h-4" /> 复制
            </button>
            <button className="btn-secondary flex items-center gap-1.5">
              <Edit3 className="w-4 h-4" /> 编辑
            </button>
            <button className="btn-danger flex items-center gap-1.5">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card icon={<Users className="w-5 h-5" />} title="基本信息" glow="shadow-glow-primary">
          <Row label="表演标题" value={slot.title} />
          <Row label="主办方" value={
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              {slot.organizerName}
            </span>
          } />
          <Row label="主办方ID" value={slot.organizerId} mono />
          <Row label="无人机编队" value={
            <span className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-primary-light" />
              {slot.fleetName}
            </span>
          } />
          <Row label="编队ID" value={slot.fleetId} mono />
        </Card>

        <Card icon={<Clock className="w-5 h-5" />} title="时间安排" glow="shadow-glow-accent">
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3 text-xs text-text-muted font-mono">
              <span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>24:00</span>
            </div>
            <div className="relative h-20 rounded-xl bg-bg-secondary border border-border overflow-hidden">
              <div className="absolute inset-0 flex">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className={`flex-1 border-r border-border-light ${i === 7 ? 'bg-warning/5' : ''}`} />
                ))}
              </div>
              <div
                className={`absolute top-3 bottom-3 rounded-lg bg-gradient-to-r ${statusColor} shadow-lg border border-white/20`}
                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
              >
                <div className="absolute inset-0 bg-white/10 animate-pulse-slow rounded-lg" />
                <div className="h-full flex items-center justify-center px-3">
                  <div className="text-white text-xs font-bold drop-shadow truncate">{dur}</div>
                </div>
              </div>
            </div>
          </div>
          <Row label="开始时间" value={
            <span className="text-success font-medium">{formatDateTime(slot.startTime)}</span>
          } />
          <Row label="结束时间" value={
            <span className="text-warning font-medium">{formatDateTime(slot.endTime)}</span>
          } />
          <Row label="总时长" value={<span className="text-accent font-semibold">{dur}</span>} />
        </Card>

        <Card icon={<MapPin className="w-5 h-5" />} title="空域信息" glow="shadow-glow-accent">
          <Row label="空域区域" value={
            <span className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-accent" />
              {slot.airspaceArea}
            </span>
          } />
          {airReport ? (
            <>
              <Row label="报备编号" value={airReport.reportNumber || '—'} mono />
              <Row label="高度范围" value={`${airReport.altitudeRange.min}m - ${airReport.altitudeRange.max}m`} />
              <Row label="民航审批" value={<StatusBadge kind="aviation" status={airReport.civilAviationStatus} />} />
              <Row label="军航审批" value={<StatusBadge kind="aviation" status={airReport.militaryAviationStatus} />} />
              <Row label="附件文档" value={`${airReport.documents.length} 份`} />
            </>
          ) : (
            <Row label="报备状态" value={
              <span className="text-text-muted italic flex items-center gap-1.5">
                <Radar className="w-4 h-4" /> 暂无空域报备信息
              </span>
            } />
          )}
        </Card>

        <Card icon={<UsersIcon className="w-5 h-5" />} title="参与信息">
          <div className="mb-5 p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-text-muted text-xs mb-1">预计参与人数</div>
                <div className="kpi-value text-primary-light">
                  {formatNumber(slot.estimatedAttendance)}
                  <span className="text-lg font-normal text-text-secondary ml-1">人</span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <UsersIcon className="w-8 h-8 text-primary-light" />
              </div>
            </div>
            <div className="mt-3 h-2 bg-bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                style={{ width: `${Math.min(100, (slot.estimatedAttendance / 150000) * 100)}%` }}
              />
            </div>
          </div>
          <div className="pt-2">
            <div className="text-text-muted text-sm mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> 活动描述
            </div>
            <p className="text-text-secondary text-sm leading-relaxed bg-bg-secondary/50 p-3 rounded-lg border border-border-light min-h-[80px]">
              {slot.description || '暂无活动描述信息。该表演时段由主办方策划，将使用指定无人机编队在上述空域进行表演活动，预计吸引大量观众到场观看。请相关部门做好协调工作。'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

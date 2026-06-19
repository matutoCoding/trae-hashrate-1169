import React, { useMemo, useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { formatDateTime } from '@/utils/dateUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FileSearch, Send, User, Clock, Search, Filter } from 'lucide-react';
import type { ReminderStatus } from '@/types';

type SourceFilter = 'all' | 'auto' | 'manual';
type TypeFilter = 'all' | 'remind' | 'escalate';

const statusColors: Record<ReminderStatus, string> = {
  sent: 'bg-bg-secondary text-text-muted border-border',
  delivered: 'bg-primary/15 text-primary-light border-primary/30',
  read: 'bg-success/15 text-success border-success/30',
};

const statusLabels: Record<ReminderStatus, string> = {
  sent: '已发送',
  delivered: '已送达',
  read: '已读',
};

const ReminderAuditPage: React.FC = () => {
  const { reminders } = useAppStore();
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [searchText, setSearchText] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = useMemo(() => {
    return reminders.filter(r => {
      if (sourceFilter === 'auto' && !r.isAuto) return false;
      if (sourceFilter === 'manual' && r.isAuto) return false;
      if (typeFilter === 'remind' && r.isEscalation) return false;
      if (typeFilter === 'escalate' && !r.isEscalation) return false;
      if (searchText) {
        const s = searchText.toLowerCase();
        const match = r.assigneeName.toLowerCase().includes(s)
          || r.operatorName?.toLowerCase().includes(s)
          || r.slotTitle.toLowerCase().includes(s);
        if (!match) return false;
      }
      if (dateFrom && r.reminderTime < dateFrom) return false;
      if (dateTo && r.reminderTime > dateTo + 'T23:59:59') return false;
      return true;
    });
  }, [reminders, sourceFilter, typeFilter, searchText, dateFrom, dateTo]);

  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(r => {
      map[r.assigneeName] = (map[r.assigneeName] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [filtered]);

  return (
    <div className="space-y-6 p-6">
      <div className="page-header">
        <div>
          <h1 className="section-title flex items-center gap-3">
            <FileSearch className="text-accent" size={28} />
            催办记录审计
          </h1>
          <p className="text-text-muted text-sm mt-1">
            追踪所有催办通知的发送、送达与阅读状态，审计催办行为合规性
          </p>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3 text-text-secondary text-sm">
          <Filter size={14} />
          <span>筛选条件</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value as SourceFilter)} className="input-field text-sm">
            <option value="all">全部来源</option>
            <option value="auto">自动催办</option>
            <option value="manual">人工催办</option>
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as TypeFilter)} className="input-field text-sm">
            <option value="all">全部类型</option>
            <option value="remind">催办</option>
            <option value="escalate">升级</option>
          </select>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input-field text-sm" placeholder="开始日期" />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input-field text-sm" placeholder="结束日期" />
          <div className="lg:col-span-2 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="搜索责任人/表演名称"
              className="input-field text-sm pl-9"
            />
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-secondary text-text-secondary">
              <tr>
                <th className="px-4 py-3 text-left font-medium">记录ID</th>
                <th className="px-4 py-3 text-left font-medium">表演名称</th>
                <th className="px-4 py-3 text-left font-medium">节点名</th>
                <th className="px-4 py-3 text-left font-medium">接收人</th>
                <th className="px-4 py-3 text-left font-medium">类型</th>
                <th className="px-4 py-3 text-left font-medium">触发时间</th>
                <th className="px-4 py-3 text-left font-medium">截止时间</th>
                <th className="px-4 py-3 text-left font-medium">状态</th>
                <th className="px-4 py-3 text-left font-medium">操作人</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-text-muted">
                    <FileSearch size={32} className="mx-auto mb-2 opacity-40" />
                    暂无匹配的催办记录
                  </td>
                </tr>
              ) : (
                filtered.map(r => {
                  const typeLabel = r.isEscalation ? '升级' : (r.isAuto ? '自动催' : '人工催');
                  const typeClass = r.isEscalation
                    ? 'bg-danger/15 text-danger border-danger/30'
                    : r.isAuto
                    ? 'bg-info/15 text-info border-info/30'
                    : 'bg-accent/15 text-accent border-accent/30';
                  return (
                    <tr key={r.id} className="border-t border-border-light hover:bg-bg-hover/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-text-muted text-xs">{r.id}</td>
                      <td className="px-4 py-3 text-text-primary font-medium">{r.slotTitle}</td>
                      <td className="px-4 py-3 text-text-secondary">{r.nodeName}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-text-primary">
                          <User size={12} className="text-accent" />
                          {r.assigneeName}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`status-badge border ${typeClass}`}>
                          {r.isEscalation ? <Send size={10} className="rotate-45" /> : <Clock size={10} />}
                          {typeLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary font-mono text-xs">{formatDateTime(r.reminderTime)}</td>
                      <td className="px-4 py-3 text-text-secondary font-mono text-xs">{formatDateTime(r.deadline)}</td>
                      <td className="px-4 py-3">
                        <span className={`status-badge border ${statusColors[r.status]}`}>
                          {statusLabels[r.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {r.isAuto ? (
                          <span className="text-info">系统</span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <User size={11} />
                            {r.operatorName}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="card-title mb-4 flex items-center gap-2">
          <User size={18} className="text-accent" />
          责任人催办汇总（共 {chartData.length} 人）
        </h3>
        <div className="h-72">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-text-muted">
              暂无统计数据
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#0F1F38', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 8, color: '#F1F5F9' }}
                  formatter={(v: number) => [`${v} 次`, '被催办次数']}
                  cursor={{ fill: 'rgba(59,130,246,0.08)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="被催办次数">
                  {chartData.map((_, i) => {
                    const colors = ['#3B82F6', '#06B6D4', '#8B5CF6', '#F97316', '#10B981', '#EF4444', '#EC4899'];
                    return <Cell key={i} fill={colors[i % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReminderAuditPage;

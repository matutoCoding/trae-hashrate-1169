import React, { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import CountdownRing from '@/components/ui/CountdownRing';
import KpiCard from '@/components/ui/KpiCard';
import { RefreshCw, AlertOctagon, AlertTriangle, Clock3, User, Send, ArrowUpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { NodeDeadlineInfo } from '@/services/timeoutService';

const ReminderCenterPage: React.FC = () => {
  const { nodeDeadlines, recomputeNodeDeadlines, sendReminder } = useAppStore();

  useEffect(() => {
    recomputeNodeDeadlines();
  }, [recomputeNodeDeadlines]);

  const overdue = nodeDeadlines.filter(d => d.remaining.isOverdue);
  const imminent = nodeDeadlines.filter(d => !d.remaining.isOverdue && d.remaining.hours < 1);
  const normal = nodeDeadlines.filter(d => !d.remaining.isOverdue && d.remaining.hours >= 1);

  const handleRefresh = () => {
    recomputeNodeDeadlines();
  };

  const handleSend = (requestId: string, escalate: boolean) => {
    sendReminder(requestId, escalate);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="page-header">
        <div>
          <h1 className="section-title flex items-center gap-3">
            <AlertOctagon className="text-danger" size={28} />
            超时催办中心
          </h1>
          <p className="text-text-muted text-sm mt-1">
            自动监控审批节点超时状态，支持人工催办与升级上报
          </p>
        </div>
        <button onClick={handleRefresh} className="btn-secondary flex items-center gap-2">
          <RefreshCw size={16} />
          刷新数据
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard title="严重超时" value={overdue.length} icon={AlertOctagon} color="danger" suffix="个" delay={0} />
        <KpiCard title="即将超时" value={imminent.length} icon={AlertTriangle} color="warning" suffix="个" delay={0.1} />
        <KpiCard title="正常待处理" value={normal.length} icon={Clock3} color="info" suffix="个" delay={0.2} />
      </div>

      <Section title="严重超时" color="danger" icon={<AlertOctagon size={18} />} items={overdue} onSend={handleSend} />
      <Section title="即将超时" color="warning" icon={<AlertTriangle size={18} />} items={imminent} onSend={handleSend} />
      <Section title="正常待处理" color="info" icon={<Clock3 size={18} />} items={normal} onSend={handleSend} />
    </div>
  );
};

interface SectionProps {
  title: string;
  color: 'danger' | 'warning' | 'info';
  icon: React.ReactNode;
  items: NodeDeadlineInfo[];
  onSend: (requestId: string, escalate: boolean) => void;
}

const Section: React.FC<SectionProps> = ({ title, color, icon, items, onSend }) => {
  const colorMap = {
    danger: { border: 'border-danger/30', bg: 'from-danger/10 to-transparent', text: 'text-danger', glow: 'shadow-glow-danger' },
    warning: { border: 'border-warning/30', bg: 'from-warning/10 to-transparent', text: 'text-warning', glow: 'shadow-glow-warning' },
    info: { border: 'border-info/30', bg: 'from-info/10 to-transparent', text: 'text-info', glow: 'shadow-glow-accent' },
  };
  const c = colorMap[color];

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`card-title flex items-center gap-2 ${c.text}`}>
          {icon}
          {title}
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-bg-secondary border border-border">
            {items.length}
          </span>
        </h3>
      </div>

      {items.length === 0 ? (
        <div className="py-12 text-center text-text-muted">
          <Clock3 size={40} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">暂无{title}项目</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item, idx) => (
            <motion.div
              key={item.approvalRequestId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className={`glass-card p-4 bg-gradient-to-br ${c.bg} ${c.border} hover:${c.glow} transition-all group`}
            >
              <div className="flex gap-4">
                <CountdownRing deadline={item.deadline} size={88} strokeWidth={5} showLabels={false} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-text-primary truncate mb-1">{item.slotTitle}</h4>
                  <p className={`text-sm ${c.text} font-medium mb-2`}>{item.nodeName}</p>
                  <div className="flex items-center gap-1 text-text-muted text-xs mb-1">
                    <User size={12} />
                    <span>审批人：{item.assigneeName}</span>
                  </div>
                  <div className="text-text-muted text-xs mb-3">
                    已等待 <span className={c.text}>{item.hoursSinceSubmit.toFixed(1)}</span> 小时
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-bg-secondary border border-border">
                      <User size={10} className="text-accent" />
                      {item.assigneeName}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onSend(item.approvalRequestId, false)}
                        className={`p-1.5 rounded-md ${color === 'danger' ? 'bg-danger/20 text-danger hover:bg-danger/30' : color === 'warning' ? 'bg-warning/20 text-warning hover:bg-warning/30' : 'bg-info/20 text-info hover:bg-info/30'} transition-colors`}
                        title="催办"
                      >
                        <Send size={14} />
                      </button>
                      {item.escalationTargetName && (
                        <button
                          onClick={() => onSend(item.approvalRequestId, true)}
                          className="p-1.5 rounded-md bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-hover border border-border transition-colors"
                          title={`升级至${item.escalationTargetName}`}
                        >
                          <ArrowUpCircle size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReminderCenterPage;

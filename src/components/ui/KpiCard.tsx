import React from 'react';
import { motion } from 'framer-motion';
import { formatPercent, formatNumber } from '@/utils/formatters';
import { ArrowUp, ArrowDown, TrendingUp, type LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  isPercent?: boolean;
  trend?: number;
  icon: LucideIcon;
  color: 'primary' | 'accent' | 'warning' | 'success' | 'danger' | 'info';
  delay?: number;
}

const colorMap = {
  primary: 'from-primary/20 to-primary/5 text-primary-light border-primary/30',
  accent: 'from-accent/20 to-accent/5 text-accent border-accent/30',
  warning: 'from-warning/20 to-warning/5 text-warning border-warning/30',
  success: 'from-success/20 to-success/5 text-success border-success/30',
  danger: 'from-danger/20 to-danger/5 text-danger border-danger/30',
  info: 'from-info/20 to-info/5 text-info border-info/30',
};

const iconBgMap = {
  primary: 'bg-primary/20 text-primary-light',
  accent: 'bg-accent/20 text-accent',
  warning: 'bg-warning/20 text-warning',
  success: 'bg-success/20 text-success',
  danger: 'bg-danger/20 text-danger',
  info: 'bg-info/20 text-info',
};

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  suffix,
  isPercent,
  trend,
  icon: Icon,
  color,
  delay = 0,
}) => {
  const displayValue = typeof value === 'number'
    ? isPercent ? formatPercent(value) : formatNumber(value)
    : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`glass-card p-5 bg-gradient-to-br ${colorMap[color]} relative overflow-hidden group`}
    >
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-current opacity-[0.04] blur-2xl transition-all group-hover:scale-125" />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-11 h-11 rounded-xl ${iconBgMap[color]} flex items-center justify-center`}>
            <Icon size={22} />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
              {trend >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="text-xs text-text-muted mb-1 font-medium tracking-wide">{title}</div>
        <div className="flex items-baseline gap-1">
          <span className="kpi-value bg-gradient-to-br from-white to-current bg-clip-text text-transparent">
            {displayValue}
          </span>
          {suffix && <span className="text-sm text-text-secondary font-medium">{suffix}</span>}
        </div>
      </div>
    </motion.div>
  );
};

export default KpiCard;

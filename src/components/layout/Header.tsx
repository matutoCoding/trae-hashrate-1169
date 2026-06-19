import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Search,
  Settings,
  User,
  ChevronDown,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { formatFullDate, formatTime } from '@/utils/dateUtils';
import { useLocation } from 'react-router-dom';

const pageTitleMap: Record<string, string> = {
  '/dashboard': '控制台仪表盘',
  '/fleet': '机阵建档管理',
  '/schedule': '表演排期日历',
  '/occupancy/merge': '占用合并列表',
  '/occupancy/split': '占用区间拆分',
  '/approval/config': '审批流程配置',
  '/approval/list': '报批申请列表',
  '/reminder/center': '超时催办中心',
  '/reminder/audit': '催办记录审计',
  '/airspace/report': '空域报备管理',
};

const Header: React.FC = () => {
  const location = useLocation();
  const { currentUser, nodeDeadlines, reminders } = useAppStore();
  const [now, setNow] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pageTitle = () => {
    for (const [path, title] of Object.entries(pageTitleMap)) {
      if (location.pathname === path || location.pathname.startsWith(path + '/')) {
        return title;
      }
    }
    if (location.pathname.startsWith('/schedule/')) return '表演时段详情';
    if (location.pathname.startsWith('/approval/')) return '审批轨迹详情';
    return '无人机表演排期系统';
  };

  const timeoutCount = nodeDeadlines.filter(d => d.remaining.isOverdue).length;
  const unreadReminders = reminders.filter(r => r.status !== 'read').length;
  const totalAlerts = timeoutCount + unreadReminders;

  return (
    <header className="h-16 bg-bg-secondary/60 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-6">
        <div>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-display text-lg font-semibold tracking-wide text-text-primary flex items-center gap-3">
              <span className="w-1 h-6 bg-gradient-to-b from-accent to-primary rounded" />
              {pageTitle()}
            </h2>
          </motion.div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-text-muted">
            <Clock size={12} />
            <span>{formatFullDate(now)}</span>
            <span className="text-border">·</span>
            <span className="font-mono text-accent">{formatTime(now)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-64 hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="搜索表演/主办方/审批单..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-bg-primary/50 border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>

        <button className="relative w-9 h-9 rounded-lg bg-bg-primary/50 border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-primary/40 transition-all">
          <Settings size={18} />
        </button>

        <button className="relative w-9 h-9 rounded-lg bg-bg-primary/50 border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-warning/50 transition-all group">
          <Bell size={18} />
          {totalAlerts > 0 && (
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-danger text-white text-[10px] flex items-center justify-center font-bold px-1 shadow-glow-danger"
            >
              {totalAlerts}
            </motion.span>
          )}
          {timeoutCount > 0 && (
            <div className="absolute top-full right-0 mt-2 w-64 glass-card p-3 hidden group-hover:block z-50">
              <div className="text-xs text-text-muted mb-2 flex items-center gap-2">
                <AlertTriangle size={14} className="text-warning" />
                超时预警
              </div>
              <div className="text-sm text-warning">{timeoutCount} 个审批节点已超时</div>
            </div>
          )}
        </button>

        <div className="h-8 w-px bg-border mx-1" />

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(v => !v)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg bg-bg-primary/50 border border-border hover:border-primary/40 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <User size={14} className="text-white" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm text-text-primary leading-tight">{currentUser.name}</div>
              <div className="text-[10px] text-text-muted font-mono">{currentUser.department}</div>
            </div>
            <ChevronDown size={14} className={`transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-2 w-56 glass-card p-2 z-50"
            >
              <div className="px-3 py-2 border-b border-border-light mb-1">
                <div className="font-medium text-text-primary">{currentUser.name}</div>
                <div className="text-xs text-text-muted">{currentUser.email}</div>
                <div className="text-xs text-text-muted">{currentUser.phone}</div>
              </div>
              <div className="px-3 py-2 text-xs text-text-muted">
                角色: <span className="text-accent">{currentUser.role}</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

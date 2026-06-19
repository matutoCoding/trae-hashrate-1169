import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Plane,
  CalendarDays,
  GitMerge,
  FileCheck2,
  BellRing,
  MapPin,
  ChevronRight,
  Hexagon,
} from 'lucide-react';

const navGroups = [
  {
    title: '全局',
    items: [
      { path: '/dashboard', label: '控制台', icon: LayoutDashboard },
    ],
  },
  {
    title: '表演排期',
    items: [
      { path: '/fleet', label: '机阵建档', icon: Hexagon },
      { path: '/schedule', label: '排期日历', icon: CalendarDays },
    ],
  },
  {
    title: '占用管理',
    items: [
      { path: '/occupancy/merge', label: '占用合并', icon: GitMerge },
      { path: '/occupancy/split', label: '占用拆分', icon: Plane },
    ],
  },
  {
    title: '报批审批',
    items: [
      { path: '/approval/list', label: '报批申请', icon: FileCheck2 },
      { path: '/approval/config', label: '流程配置', icon: FileCheck2 },
      { path: '/airspace/report', label: '空域报备', icon: MapPin },
    ],
  },
  {
    title: '超时催办',
    items: [
      { path: '/reminder/center', label: '催办中心', icon: BellRing },
      { path: '/reminder/audit', label: '审计记录', icon: FileCheck2 },
    ],
  },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="w-64 h-screen bg-bg-secondary/80 backdrop-blur-xl border-r border-border flex flex-col sticky top-0 z-30">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow-primary">
              <Hexagon size={22} className="text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-bg-secondary animate-pulse" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-wider bg-gradient-to-r from-primary-light via-accent to-primary-light bg-clip-text text-transparent">
              SkyStage
            </h1>
            <p className="text-[10px] text-text-muted font-mono tracking-widest">
              UAV SHOW MANAGER
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {navGroups.map((group, gi) => (
          <div key={group.title}>
            <div className="px-4 mb-2 flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              <span className="text-[10px] font-display uppercase tracking-[0.15em] text-text-muted">
                {group.title}
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent" />
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className="relative group"
                  >
                    <div
                      className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r bg-gradient-to-b from-accent to-primary"
                        />
                      )}
                      <Icon size={18} className={isActive ? 'text-accent' : ''} />
                      <span className="flex-1 text-sm font-medium">{item.label}</span>
                      <ChevronRight
                        size={14}
                        className={`opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-text-muted`}
                      />
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="glass-card p-3 bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-text-secondary">系统版本</span>
            <span className="font-mono text-accent">v1.0.0</span>
          </div>
          <div className="h-1 rounded-full bg-bg-secondary overflow-hidden">
            <div className="h-full w-3/4 bg-gradient-to-r from-primary to-accent rounded-full" />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

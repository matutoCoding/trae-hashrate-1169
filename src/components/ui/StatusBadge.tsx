import React from 'react';
import type { SlotStatus, OccupancyStatus, ApprovalStatus, AviationStatus, FleetStatus } from '@/types';
import { slotStatusMap, occupancyStatusMap, approvalStatusMap, aviationStatusMap, fleetStatusMap } from '@/utils/formatters';

type StatusKind = 'slot' | 'occupancy' | 'approval' | 'aviation' | 'fleet';

interface StatusBadgeProps {
  kind: StatusKind;
  status: string;
  pulse?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ kind, status, pulse }) => {
  const getMap = () => {
    switch (kind) {
      case 'slot': return slotStatusMap[status as SlotStatus];
      case 'occupancy': return occupancyStatusMap[status as OccupancyStatus];
      case 'approval': return approvalStatusMap[status as ApprovalStatus];
      case 'aviation': return aviationStatusMap[status as AviationStatus];
      case 'fleet': return fleetStatusMap[status as FleetStatus];
      default: return null;
    }
  };
  const info = getMap();
  if (!info) return null;
  const shouldPulse = pulse || (info as any).pulse;

  return (
    <span
      className={`status-badge border ${info.className} ${shouldPulse ? 'animate-glow-pulse' : ''}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {info.label}
    </span>
  );
};

export default StatusBadge;

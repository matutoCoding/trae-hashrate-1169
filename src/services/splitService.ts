import type { OccupancyBlock, PerformanceSlot, SplitLog } from '@/types';
import { genId } from '@/utils/formatters';
import { parseISO, getMinutesBetween, buildDateTime, formatDate, formatTime } from '@/utils/dateUtils';

export interface SplitResult {
  beforeOcc: OccupancyBlock;
  afterOcc: OccupancyBlock;
  splitLog: SplitLog;
  newSlots: PerformanceSlot[];
}

export const canSplitAt = (
  occupancy: OccupancyBlock,
  splitPoint: string
): { ok: boolean; reason?: string } => {
  const start = parseISO(occupancy.startTime).getTime();
  const end = parseISO(occupancy.endTime).getTime();
  const point = parseISO(splitPoint).getTime();
  if (point <= start) return { ok: false, reason: '拆分点不能早于或等于占用起始时间' };
  if (point >= end) return { ok: false, reason: '拆分点不能晚于或等于占用结束时间' };
  return { ok: true };
};

export const executeSplit = (
  occupancy: OccupancyBlock,
  allSlots: PerformanceSlot[],
  splitPoint: string,
  reason: string,
  operatorId: string,
  operatorName: string
): SplitResult => {
  const slots = allSlots.filter(s => occupancy.slotIds.includes(s.id));
  const point = parseISO(splitPoint);

  const beforeSlots: PerformanceSlot[] = [];
  const afterSlots: PerformanceSlot[] = [];
  const brandNewSlots: PerformanceSlot[] = [];

  for (const slot of slots) {
    const s = parseISO(slot.startTime).getTime();
    const e = parseISO(slot.endTime).getTime();
    const p = point.getTime();
    if (e <= p) {
      beforeSlots.push(slot);
    } else if (s >= p) {
      afterSlots.push(slot);
    } else {
      const slotBefore: PerformanceSlot = {
        ...slot,
        id: genId('s_'),
        endTime: splitPoint,
        updatedAt: new Date().toISOString(),
      };
      const slotAfter: PerformanceSlot = {
        ...slot,
        id: genId('s_'),
        startTime: splitPoint,
        updatedAt: new Date().toISOString(),
      };
      beforeSlots.push(slotBefore);
      afterSlots.push(slotAfter);
      brandNewSlots.push(slotBefore, slotAfter);
    }
  }

  const beforeOccId = genId('occ_');
  const afterOccId = genId('occ_');

  const beforeOcc: OccupancyBlock = {
    id: beforeOccId,
    organizerId: occupancy.organizerId,
    organizerName: occupancy.organizerName,
    fleetId: occupancy.fleetId,
    fleetName: occupancy.fleetName,
    startTime: occupancy.startTime,
    endTime: splitPoint,
    slotIds: beforeSlots.map(s => s.id),
    isMerged: beforeSlots.length > 1,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  const afterOcc: OccupancyBlock = {
    id: afterOccId,
    organizerId: occupancy.organizerId,
    organizerName: occupancy.organizerName,
    fleetId: occupancy.fleetId,
    fleetName: occupancy.fleetName,
    startTime: splitPoint,
    endTime: occupancy.endTime,
    slotIds: afterSlots.map(s => s.id),
    isMerged: afterSlots.length > 1,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  const splitLog: SplitLog = {
    id: genId('sl_'),
    sourceOccupancyId: occupancy.id,
    resultOccupancyIds: [beforeOccId, afterOccId],
    splitPoint,
    operatorId,
    operatorName,
    reason,
    operationTime: new Date().toISOString(),
  };

  return {
    beforeOcc,
    afterOcc,
    splitLog,
    newSlots: brandNewSlots,
  };
};

export const buildSplitPointList = (
  occupancy: OccupancyBlock,
  stepMinutes: number = 30
): { value: string; label: string }[] => {
  const points: { value: string; label: string }[] = [];
  const start = parseISO(occupancy.startTime);
  const end = parseISO(occupancy.endTime);
  const totalMins = getMinutesBetween(occupancy.startTime, occupancy.endTime);
  const steps = Math.floor(totalMins / stepMinutes);
  for (let i = 1; i < steps; i++) {
    const d = new Date(start.getTime() + i * stepMinutes * 60 * 1000);
    if (d.getTime() < end.getTime()) {
      const dateStr = formatDate(d);
      const timeStr = formatTime(d);
      points.push({
        value: buildDateTime(dateStr, timeStr),
        label: `${formatDate(d)} ${formatTime(d)}`,
      });
    }
  }
  return points;
};

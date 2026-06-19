import type { PerformanceSlot, MergeCandidate, OccupancyBlock, MergeLog } from '@/types';
import { isAdjacent, getMinutesBetween } from '@/utils/dateUtils';
import { genId } from '@/utils/formatters';

export const findMergeCandidates = (slots: PerformanceSlot[]): MergeCandidate[] => {
  const candidates: MergeCandidate[] = [];
  const mergeableStatuses: PerformanceSlot['status'][] = ['confirmed', 'approved'];
  const filtered = slots.filter(s => mergeableStatuses.includes(s.status) && !s.occupancyId);
  const groupedByFleet = new Map<string, PerformanceSlot[]>();

  for (const slot of filtered) {
    if (!groupedByFleet.has(slot.fleetId)) {
      groupedByFleet.set(slot.fleetId, []);
    }
    groupedByFleet.get(slot.fleetId)!.push(slot);
  }

  for (const [fleetId, fleetSlots] of groupedByFleet) {
    const sorted = [...fleetSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
    let i = 0;
    while (i < sorted.length) {
      const group: PerformanceSlot[] = [sorted[i]];
      let j = i + 1;
      while (j < sorted.length) {
        const prev = group[group.length - 1];
        const curr = sorted[j];
        if (
          prev.organizerId === curr.organizerId &&
          isAdjacent(prev.endTime, curr.startTime)
        ) {
          group.push(curr);
          j++;
        } else {
          break;
        }
      }
      if (group.length >= 2) {
        const first = group[0];
        const last = group[group.length - 1];
        candidates.push({
          id: genId('mc_'),
          organizerId: first.organizerId,
          organizerName: first.organizerName,
          fleetId,
          fleetName: first.fleetName,
          slots: group,
          startTime: first.startTime,
          endTime: last.endTime,
          totalHours: getMinutesBetween(first.startTime, last.endTime) / 60,
        });
      }
      i = j;
    }
  }
  return candidates;
};

export const executeMerge = (
  candidate: MergeCandidate,
  currentOperatorId: string,
  currentOperatorName: string,
  remark?: string
): { occupancy: OccupancyBlock; mergeLog: MergeLog; updatedSlotIds: string[] } => {
  const occupancyId = genId('occ_');
  const occupancy: OccupancyBlock = {
    id: occupancyId,
    organizerId: candidate.organizerId,
    organizerName: candidate.organizerName,
    fleetId: candidate.fleetId,
    fleetName: candidate.fleetName,
    startTime: candidate.startTime,
    endTime: candidate.endTime,
    slotIds: candidate.slots.map(s => s.id),
    isMerged: true,
    mergedFromIds: candidate.slots.map(s => `occ_orig_${s.id}`),
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  const mergeLog: MergeLog = {
    id: genId('ml_'),
    mergedOccupancyId: occupancyId,
    sourceOccupancyIds: candidate.slots.map(s => `occ_orig_${s.id}`),
    operatorId: currentOperatorId,
    operatorName: currentOperatorName,
    operationTime: new Date().toISOString(),
    remark,
  };
  return {
    occupancy,
    mergeLog,
    updatedSlotIds: candidate.slots.map(s => s.id),
  };
};

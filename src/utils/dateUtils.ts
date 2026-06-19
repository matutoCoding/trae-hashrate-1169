import {
  format,
  parseISO,
  addHours,
  differenceInHours,
  differenceInMinutes,
  isAfter,
  isBefore,
  isSameDay,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const formatDateTime = (date: string | Date, pattern: string = 'yyyy-MM-dd HH:mm') => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern, { locale: zhCN });
};

export const formatDate = (date: string | Date) => formatDateTime(date, 'yyyy-MM-dd');
export const formatTime = (date: string | Date) => formatDateTime(date, 'HH:mm');
export const formatFullDate = (date: string | Date) => formatDateTime(date, 'yyyy年MM月dd日');

export const isOverlapping = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  const s1 = parseISO(start1).getTime();
  const e1 = parseISO(end1).getTime();
  const s2 = parseISO(start2).getTime();
  const e2 = parseISO(end2).getTime();
  return s1 < e2 && s2 < e1;
};

export const isAdjacent = (end1: string, start2: string): boolean => {
  return parseISO(end1).getTime() === parseISO(start2).getTime();
};

export const getHoursBetween = (start: string, end: string): number => {
  return differenceInHours(parseISO(end), parseISO(start));
};

export const getMinutesBetween = (start: string, end: string): number => {
  return differenceInMinutes(parseISO(end), parseISO(start));
};

export const calcDeadline = (submissionTime: string, timeoutHours: number): string => {
  return addHours(parseISO(submissionTime), timeoutHours).toISOString();
};

export const isTimeout = (submissionTime: string, timeoutHours: number): boolean => {
  const deadline = addHours(parseISO(submissionTime), timeoutHours);
  return isAfter(new Date(), deadline);
};

export const getRemainingTime = (deadline: string): { hours: number; minutes: number; seconds: number; isOverdue: boolean } => {
  const now = new Date().getTime();
  const dl = parseISO(deadline).getTime();
  const diff = dl - now;
  const isOverdue = diff < 0;
  const absDiff = Math.abs(diff);
  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);
  return { hours, minutes, seconds, isOverdue };
};

export const getWeekDays = (date: Date = new Date()): Date[] => {
  return eachDayOfInterval({
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  });
};

export const getMonthDays = (date: Date = new Date()): Date[] => {
  return eachDayOfInterval({
    start: startOfMonth(date),
    end: endOfMonth(date),
  });
};

export const getTimeSlots = (startHour: number = 8, endHour: number = 24, stepMinutes: number = 30): { time: string; label: string }[] => {
  const slots: { time: string; label: string }[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      slots.push({ time: timeStr, label: timeStr });
    }
  }
  return slots;
};

export const buildDateTime = (dateStr: string, timeStr: string): string => {
  return `${dateStr}T${timeStr}:00`;
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  }
  return `${mins}分钟`;
};

export { isSameDay, isAfter, isBefore, startOfWeek, endOfWeek, startOfMonth, endOfMonth };
export { parseISO, addHours } from 'date-fns';

import {
  format,
  isToday,
  isTomorrow,
  isYesterday,
  isPast,
  isFuture,
  differenceInDays,
  startOfWeek,
  addDays,
  parseISO,
} from 'date-fns';

export function formatDeadline(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

export function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const date = parseISO(dateStr);
  return isPast(date) && !isToday(date);
}

export function isDueToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return isToday(parseISO(dateStr));
}

export function isDueSoon(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const date = parseISO(dateStr);
  const days = differenceInDays(date, new Date());
  return days >= 0 && days <= 2;
}

export function getWeekDays(referenceDate = new Date()): Date[] {
  const start = startOfWeek(referenceDate, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatTime(dateStr: string): string {
  return format(parseISO(dateStr), 'h:mm a');
}

export function formatRelative(dateStr: string): string {
  const date = parseISO(dateStr);
  const days = differenceInDays(new Date(), date);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return format(date, 'MMM d');
}

export function daysUntil(dateStr: string): number {
  return differenceInDays(parseISO(dateStr), new Date());
}

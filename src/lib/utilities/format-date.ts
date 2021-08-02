import { format } from 'date-fns';

export function formatDate(date: Date | string | null): string {
  if (!date) return '';
  if (date instanceof String) date = new Date(date);
  return format(date as Date, 'MMMM dd, yyyy — h:mm a');
}

import { format } from 'date-fns';

export function formatDate(date: Date | null): string {
  if (!date) return '';
  return format(date, 'MMMM dd, yyyy — h:mm a');
}

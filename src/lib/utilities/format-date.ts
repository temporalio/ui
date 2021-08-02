import { format, parseJSON } from 'date-fns';

export function formatDate(date: Date | string | null): string {
  if (!date) return '';
  return format(parseJSON(date), 'MMMM dd, yyyy — h:mm a');
}

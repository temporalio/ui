export const DATE_PICKER_INPUT_FORMAT = 'MM/DD/YYYY';

export const formatDatePickerInput = (date: Date): string => {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const year = `${date.getFullYear()}`.padStart(4, '0');
  return `${month}/${day}/${year}`;
};

export const parseDatePickerInput = (value: string): Date | null => {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;

  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

export type DatePickerInputResult = {
  date: Date | null;
  error: boolean;
};

export const evaluateDatePickerInput = (
  value: string,
  isAllowed: (date: Date) => boolean = () => true,
): DatePickerInputResult => {
  if (!value.trim()) return { date: null, error: false };

  const date = parseDatePickerInput(value);
  if (!date || !isAllowed(date)) return { date: null, error: true };

  return { date, error: false };
};

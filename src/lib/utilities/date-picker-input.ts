import { format, isValid, parse } from 'date-fns';

export const DATE_PICKER_INPUT_FORMAT = 'MM/DD/YYYY';

const DATE_FNS_FORMAT = 'MM/dd/yyyy';
const REFERENCE_DATE = new Date(0);

export const formatDatePickerInput = (date: Date): string =>
  format(date, DATE_FNS_FORMAT);

export const parseDatePickerInput = (value: string): Date | null => {
  const date = parse(value.trim(), DATE_FNS_FORMAT, REFERENCE_DATE);
  return isValid(date) ? date : null;
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

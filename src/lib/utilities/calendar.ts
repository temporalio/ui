export const monthNames = [
  { label: 'Every month', value: '*' },
  { label: 'January', value: '1' },
  { label: 'February', value: '2' },
  { label: 'March', value: '3' },
  { label: 'April', value: '4' },
  { label: 'May', value: '5' },
  { label: 'June', value: '6' },
  { label: 'July', value: '7' },
  { label: 'August', value: '8' },
  { label: 'September', value: '9' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' },
];

export const genericWeekDays = [
  { label: 'Everyday', value: '*' },
  { label: 'Weekdays', value: '1,2,3,4,5' },
  { label: 'Weekends', value: '6,7' },
];
export const weekDays = [
  { label: 'Sunday', value: '7' },
  { label: 'Monday', value: '1' },
  { label: 'Tuesday', value: '2' },
  { label: 'Wednesday', value: '3' },
  { label: 'Thursday', value: '4' },
  { label: 'Friday', value: '5' },
  { label: 'Saturday', value: '6' },
];

const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const isLeapYear = (year: number) => year % 4 === 0;
const getEmptyRows: () => number[] = () => {
  // Max days = 7 days * 6 week rows = 42
  const rows = Array.from({ length: 42 });
  return rows.map(() => 0);
};
const getMonthDays = (index: number, year: number) => {
  return index !== 1 ? monthDays[index] : isLeapYear(year) ? 29 : 28;
};

const getMonthStats = (monthIndex: number, year: number) => {
  const today = new Date(year, monthIndex, 1);
  const index = today.getMonth();
  return {
    name: monthNames[index],
    days: getMonthDays(index, year),
  };
};

export const getMonthName = (index: number) =>
  monthNames.filter((m) => m.value !== '*')[index];

export const getDateRows = (monthIndex: number, year: number) => {
  const { days } = getMonthStats(monthIndex, year);
  const rows = getEmptyRows();
  const startIndex = new Date(year, monthIndex, 1).getDay();
  Array.from({ length: days }).forEach((_, i) => {
    const index = startIndex + i;
    rows[index] = i + 1;
  });
  const filled = rows.map((i) => (Array.isArray(i) ? undefined : i));

  return filled[35] ? filled : filled.slice(0, -7);
};

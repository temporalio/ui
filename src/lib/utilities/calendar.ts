export const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const isLeapYear = (year) => year % 4 === 0;
const getEmptyRows: () => number[] = () => {
  // Max days = 7 days * 6 week rows = 42
  const rows = Array.from({ length: 42 });
  return rows.map(() => 0);
};
const getMonthDays = (index, year) => {
  return index !== 1 ? monthDays[index] : isLeapYear(year) ? 29 : 28;
};

const getMonthStats = (monthIndex, year) => {
  const today = new Date(year, monthIndex, 1);
  const index = today.getMonth();
  return {
    name: index[index],
    days: getMonthDays(index, year),
  };
};

export const getMonthName = (index) => monthNames[index];

export const getDateRows = (monthIndex, year) => {
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

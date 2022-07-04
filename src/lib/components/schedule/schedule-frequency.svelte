<script lang="ts">
  export let calendar;
  export let interval;

  const month = calendar?.month || '*';
  const dayOfMonth = calendar?.dayOfMonth || '*';
  const dayOfWeek = calendar?.dayOfWeek || '*';

  const getInterval = (interval: string) => {
    if (interval?.toString().endsWith('s')) {
      const seconds = parseInt(interval.slice(0, interval.length - 1));
      return seconds / 60;
    }
    return interval;
  };

  const getSuffix = (day: number): string => {
    const j = day % 10;
    const k = day % 100;
    if (j == 1 && k != 11) return `${day}st`;
    if (j == 2 && k != 12) return `${day}nd`;
    if (j == 3 && k != 13) return `${day}rd`;
    return `${day}th`;
  };

  const getProperDayNames = (days: string): string => {
    const daysList = days.split(',');
    return daysList
      .map((day) => day.charAt(0).toUpperCase() + day.slice(1))
      .join(', ');
  };

  const getProperMonthName = {
    '1': 'January',
    '2': 'February',
    '3': 'March',
    '4': 'April',
    '5': 'May',
    '6': 'June',
    '7': 'July',
    '8': 'August',
    '9': 'September',
    '10': 'October',
    '11': 'November',
    '12': 'December',
  };

  const humanReadableCalendar = (calendar) => {
    let label = '';
    if (
      !calendar?.year &&
      !calendar?.month &&
      !calendar?.dayOfMonth &&
      !calendar?.dayOfWeek
    ) {
      label = `Every day`;
    } else if (
      !calendar?.year &&
      !calendar?.month &&
      !calendar?.dayOfMonth &&
      calendar?.dayOfWeek
    ) {
      label = `Every ${getProperDayNames(dayOfWeek)}`;
    } else if (
      !calendar?.year &&
      !calendar?.month &&
      calendar?.dayOfMonth &&
      !calendar?.dayOfWeek
    ) {
      label = `Every ${getSuffix(parseInt(dayOfMonth))} of the month`;
    } else if (!calendar?.year && calendar?.month) {
      label = `Every ${getProperMonthName[month]}`;
      if (calendar?.dayOfWeek) {
        label += ` on every ${getProperDayNames(dayOfWeek)}`;
      } else if (calendar?.dayOfMonth) {
        label += `${calendar?.dayOfMonth}`;
      }
    } else if (calendar?.year) {
      label = `For ${calendar?.year},`;
      if (calendar?.month) {
        label += ` on ${getProperMonthName[month]}`;
      }
      if (calendar?.dayOfWeek) {
        label += ` on every ${getProperDayNames(dayOfWeek)}`;
      } else if (calendar?.dayOfMonth) {
        label += ` ${calendar?.dayOfMonth}`;
      }
    }

    if (calendar?.hour) {
      label += ` at the ${getSuffix(parseInt(calendar.hour))} hour`;
    }

    if (calendar?.minute) {
      label += ` on the ${getSuffix(parseInt(calendar.minute))} minute`;
    }

    if (calendar?.second) {
      label += ` on the ${getSuffix(parseInt(calendar.second))} second`;
    }

    return label;
  };
</script>

{#if !calendar}
  <p>Every {getInterval(interval?.interval ?? 0)} minutes</p>
{:else}
  <div class="flex flex-row gap-4">
    {humanReadableCalendar(calendar)}
  </div>
{/if}

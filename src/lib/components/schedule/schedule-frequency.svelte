<script lang="ts">
  export let calendar;
  export let interval;

  const year = calendar?.year || '*';
  const month = calendar?.month || '*';
  const dayOfMonth = calendar?.dayOfMonth || '*';
  const dayOfWeek = calendar?.dayOfWeek || '*';
  const hour = calendar?.hour || '*';
  const minute = calendar?.minute || '*';
  const second = calendar?.second || '*';

  const getInterval = (interval: string) => {
    if (interval.endsWith('s')) {
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
      label = `Every ${month}`;
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
  <p>Every {getInterval(interval.interval)} minutes</p>
{:else}
  <div class="flex flex-row gap-4">
    {humanReadableCalendar(calendar)}
  </div>
{/if}

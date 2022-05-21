<script lang="ts">
  import Panel from '$lib/components/panel.svelte';

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
</script>

<Panel>
  <h2 class="text-2xl mb-4">Frequency</h2>
  <div class="pr-2">
    {#if !calendar}
      <p>Every {getInterval(interval.interval)} minutes</p>
    {:else}
      <p>
        Year: {year}, Month: {month}, Day Of Month: {dayOfMonth}, Day Of Week: {dayOfWeek},
        Hour: {hour}, Minute: {minute}, Second: {second}
      </p>
    {/if}
  </div>
</Panel>

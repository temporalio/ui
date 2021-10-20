<script lang="ts">
  import Time from 'svelte-time';
  export let time: string;
  export let timeFormat: string;

  $: utc = new Date(time).toUTCString();
  $: relative = new Date(time).getTime();
</script>

{#if time === 'null'}
  <p />
{:else if time && timeFormat === 'relative'}
  <Time live relative timestamp={relative} />
{:else if time && timeFormat === 'current'}
  <p>{time}</p>
{:else if time && timeFormat === 'UTC'}
  <p>{utc}</p>
{/if}

<style lang="postcss">
  p {
    @apply font-mono;
  }
</style>

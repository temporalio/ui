<script lang="ts">
  import Time from 'svelte-time';
  export let time: string;
  export let timeFormat: string;

  $: utc = new Date(time.split(' —').join('')).toUTCString();
  $: relative = new Date(time.split(' —').join('')).getTime();
</script>

{#if time && timeFormat === 'relative'}
  <Time live relative timestamp={relative} />
{/if}

{#if time && timeFormat === 'current'}
  <p>{time}</p>
{/if}

{#if time && timeFormat === 'UTC'}
  <p>{utc}</p>
{/if}

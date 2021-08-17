<script lang="ts">
  import Time from 'svelte-time';
  export let time: string; //needs type;
  export let relativeTime;
</script>

{#if time && relativeTime}
  <Time
    live
    relative
    timestamp={new Date(time.split(' —').join('')).getTime()}
  />
{/if}

{#if time && !relativeTime}
  <p>{time}</p>
{/if}

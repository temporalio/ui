<script lang="ts">
  import Time from 'svelte-time';
  export let time: string; //needs type;
</script>

{#if time}
  <Time
    live
    relative
    timestamp={new Date(time.split(' —').join('')).getTime()}
  />
{/if}

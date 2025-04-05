<script lang="ts">
  import { type IconName, icons } from './paths';

  export let name: IconName;
  export let width = 16;
  export let height = 16;
  export let title = '';

  $: icon = icons[name];
</script>

{#if icon}
  <svelte:component
    this={icon}
    {width}
    {height}
    {title}
    class="shrink-0 {$$props.class}"
    {...$$restProps}
  />
{/if}

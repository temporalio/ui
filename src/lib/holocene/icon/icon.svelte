<script lang="ts">
  import { type IconName, icons } from './paths';

  export let name: IconName;
  export let width = 24;
  export let height = 24;
  export let title = '';

  $: icon = icons[name];
</script>

{#if icon}
  <svelte:component
    this={icon}
    {width}
    {height}
    {title}
    {name}
    class={$$props.class}
    {...$$restProps}
  />
{/if}

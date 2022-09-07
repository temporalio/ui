<script>import { icons } from './paths';
export let name;
export let width = 24;
export let height = 24;
$: icon = icons[name];
</script>

{#if icon}
  <svelte:component this={icon} {width} {height} class={$$props.class} />
{/if}

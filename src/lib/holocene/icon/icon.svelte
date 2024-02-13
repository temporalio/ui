<script lang="ts">
  import type { IconName } from './types';

  export let name: IconName;
  export let width = 24;
  export let height = 24;
  export let title = '';

  $: icon = import(`./svg/${name}.svelte`)
    .then((module) => module.default)
    .catch(() => console.error(`🔥 Icon not found: ${name}`));
</script>

<div style="height: {height}; width: {width};">
  {#await icon then icon}
    <svelte:component
      this={icon}
      {width}
      {height}
      {title}
      class={$$props.class}
      {...$$restProps}
    />
  {/await}
</div>

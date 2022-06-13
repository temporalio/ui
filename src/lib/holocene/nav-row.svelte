<script lang="ts">
  export let link: string | null = null;
  export let isCloud: boolean;
  export let noFilter = false;
  export let wrap = false;
  export let externalLink = false;
  let classes = `nav-row ${$$props.class} ${isCloud ? 'cloud' : 'local'}`;
</script>

<li
  class={link ? '' : classes}
  class:noFilter
  class:wrap
  data-cy={$$props['data-cy']}
>
  {#if link && externalLink}
    <a href={link} target="_blank" class={classes}>
      <slot />
    </a>
  {:else if link}
    <a href={link} class={classes}>
      <slot />
    </a>
  {:else}
    <slot />
  {/if}
</li>

<style lang="postcss">
  .nav-row {
    @apply flex flex-row items-center whitespace-nowrap rounded-lg py-1 text-sm font-medium;
  }
  .wrap {
    @apply whitespace-normal;
  }
  .local {
    @apply text-white;
  }
  .cloud {
    @apply text-gray-900;
  }
  .local:hover {
    @apply bg-white text-gray-900;
  }
  .cloud:hover {
    @apply bg-gray-900 text-white;
  }
  .local :global(svg) {
    filter: invert(100%);
    -webkit-filter: invert(100%);
  }
  .local:hover :global(svg) {
    filter: invert(0);
    -webkit-filter: invert(0%);
  }
  .cloud:hover :global(svg) {
    filter: invert(100%);
    -webkit-filter: invert(100%);
  }
  .noFilter :global(svg) {
    filter: invert(0%);
    -webkit-filter: invert(0%);
  }
  .noFilter:hover :global(svg) {
    filter: invert(0%);
    -webkit-filter: invert(0%);
  }
</style>

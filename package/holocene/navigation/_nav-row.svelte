<script>export let link = null;
export let isCloud;
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
  on:click
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

<style>
  .nav-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    white-space: nowrap;
    border-radius: 0.5rem;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 500
}
  .wrap {
    white-space: normal
}
  .local {
    --tw-text-opacity: 1;
    color: rgb(255 255 255 / var(--tw-text-opacity))
}
  .cloud {
    --tw-text-opacity: 1;
    color: rgb(24 24 27 / var(--tw-text-opacity))
}
  .local:hover {
    --tw-bg-opacity: 1;
    background-color: rgb(255 255 255 / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: rgb(24 24 27 / var(--tw-text-opacity))
}
  .cloud:hover {
    --tw-bg-opacity: 1;
    background-color: rgb(24 24 27 / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: rgb(255 255 255 / var(--tw-text-opacity))
}</style>

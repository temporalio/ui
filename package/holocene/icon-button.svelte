<script>import Icon from '$holocene/icon/icon.svelte';
export let icon = null;
export let classes = '';
export let type = 'button';
</script>

<button class="icon-button" on:click data-cy={$$props.dataCy} {type}>
  {#if icon}
    <div class="flex items-center justify-center gap-2 {classes}">
      <Icon class="h-4" name={icon} />
      <slot />
    </div>
  {:else}
    <slot />
  {/if}
</button>

<style>
  .icon-button {
    display: inline-block;
    height: 2rem;
    width: 2rem;
    font-size: 0.875rem;
    line-height: 1.25rem
}</style>

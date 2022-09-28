<script lang="ts">
  import Icon from '$holocene/icon/icon.svelte';

  import type { IconName } from '$lib/holocene/icon/paths';

  export let icon: IconName = null;
  export let classes: string = '';
  export let type = 'button';
  export let size: 'default' | 'small' = 'default';
</script>

<button
  class="icon-button"
  class:default={size === 'default'}
  class:small={size === 'small'}
  on:click
  data-cy={$$props.dataCy}
  {type}
>
  {#if icon}
    <div class="flex items-center justify-center gap-2 {classes}">
      <Icon class="h-4" name={icon} />
      <slot />
    </div>
  {:else}
    <slot />
  {/if}
</button>

<style lang="postcss">
  .icon-button-default {
    @apply inline-block text-sm;
  }
  .default {
    @apply inline-block h-8 w-8 text-sm;
  }
  .small {
    @apply inline-block h-4 w-4 text-sm;
  }
</style>

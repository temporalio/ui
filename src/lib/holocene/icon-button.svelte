<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { IconName } from '$lib/holocene/icon/paths';

  interface $$Props extends HTMLButtonAttributes {
    icon?: IconName;
    classes?: string;
    'data-testid'?: string;
    hoverable?: boolean;
  }

  export let icon: IconName = null;
  export let classes = '';
  export let hoverable = false;
</script>

<button
  type="button"
  class="icon-button"
  class:hoverable
  on:click
  data-testid={$$props['data-testid']}
  {...$$restProps}
>
  {#if icon}
    <div class="flex items-center justify-center gap-2 {classes}">
      <Icon name={icon} />
      <slot />
    </div>
  {:else}
    <slot />
  {/if}
</button>

<style lang="postcss">
  .icon-button {
    @apply inline-block w-auto rounded-full text-sm;

    &.hoverable {
      @apply hover:bg-gray-300;
    }
  }
</style>

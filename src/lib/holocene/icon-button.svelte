<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';

  import type { IconName } from '$lib/holocene/icon/paths';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface $$Props extends HTMLButtonAttributes {
    icon?: IconName;
    classes?: string;
    'data-testid'?: string;
    iconSize?: number;
    hoverable?: boolean;
  }

  export let icon: IconName = null;
  export let classes: string = '';
  export let hoverable: boolean = false;
  export let iconSize: number = 24;
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
      <Icon name={icon} width={iconSize} height={iconSize} />
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

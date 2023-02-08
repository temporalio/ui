<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';

  import type { IconName } from '$lib/holocene/icon/paths';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface $$Props extends HTMLButtonAttributes {
    icon?: IconName;
    classes?: string;
    'data-cy'?: string;
  }

  export let icon: IconName = null;
  export let classes: string = '';
</script>

<button
  type="button"
  class="icon-button"
  on:click
  data-cy={$$props['data-cy']}
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
    @apply inline-block w-auto text-sm;
  }
</style>

<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';

  export let disabled = false;
  export let loading = false;
  export let active = false;
  export let icon: IconName = null;
  let className = '';
  export { className as class };
</script>

<button
  on:click|stopPropagation
  class={merge(
    'surface-subtle flex items-center justify-center gap-2 rounded-full px-3 py-1 text-sm',
    active && 'bg-interactive text-white',
    className,
  )}
  {disabled}
>
  {#if icon}
    <span class:animate-spin={loading}>
      <Icon name={loading ? 'spinner' : icon} />
    </span>
  {/if}
  <slot />
</button>

<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import Button from '$lib/holocene/button.svelte';
  import type { IconName } from '$lib/holocene/icon';

  interface $$Props extends HTMLButtonAttributes {
    icon: IconName;
    'data-testid'?: string;
    label: string;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md';
    class?: string;
  }

  let className = '';
  export { className as class };
  export let icon: IconName;
  export let label: string;
  export let variant: 'primary' | 'secondary' | 'ghost' = 'ghost';
  export let size: 'sm' | 'md' = 'md';

  const sizes: Record<'sm' | 'md', string> = {
    sm: 'h-6 w-6',
    md: 'h-9 w-9',
  };
</script>

<Button
  {variant}
  leadingIcon={icon}
  class={merge('shrink-0 p-0', sizes[size], className)}
  aria-label={label}
  disableTracking={true}
  data-track-name="icon-button"
  data-track-intent="{variant}-{icon}"
  data-track-text={label}
  on:click
  {...$$restProps}
/>

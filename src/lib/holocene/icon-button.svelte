<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import Button from '$lib/holocene/button.svelte';
  import type { IconName } from '$lib/holocene/icon';

  interface $$Props extends HTMLButtonAttributes {
    icon: IconName;
    'data-testid'?: string;
    label: string;
  }

  let className = '';
  export { className as class };
  export let icon: IconName;
  export let label: string;
</script>

<Button
  variant="ghost"
  leadingIcon={icon}
  class={merge('h-9 w-9 shrink-0 rounded-full p-0', className)}
  aria-label={label}
  on:click
  {...$$restProps}
/>

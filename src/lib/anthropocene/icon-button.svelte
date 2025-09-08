<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import Button from '$lib/anthropocene/button.svelte';
  import type { IconName } from '$lib/anthropocene/icon';

  interface Props extends HTMLButtonAttributes {
    icon: IconName;
    'data-testid'?: string;
    label: string;
    variant?: 'primary' | 'secondary' | 'ghost';
    class?: string;
    onclick?: (event: MouseEvent) => void;
  }

  let {
    icon,
    label,
    variant = 'ghost',
    class: className = '',
    onclick,
    ...restProps
  }: Props = $props();
</script>

<Button
  {variant}
  leadingIcon={icon}
  class={merge('h-9 w-9 shrink-0 rounded-full p-0', className)}
  aria-label={label}
  {onclick}
  {...restProps}
/>

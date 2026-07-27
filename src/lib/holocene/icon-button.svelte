<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import type { ComponentProps } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Button, {
    type ButtonWithoutHrefProps,
  } from '$lib/holocene/button-runes.svelte';
  import type { IconName } from '$lib/holocene/icon';

  interface Props extends Omit<HTMLButtonAttributes, 'onclick'> {
    icon: IconName;
    'data-testid'?: string;
    label: string;
    variant?: 'primary' | 'secondary' | 'ghost';
    class?: string;
    size?: ComponentProps<typeof Button>['size'];
    onclick?: (event: MouseEvent) => void;
  }

  let {
    class: className = '',
    icon,
    label,
    variant = 'ghost',
    onclick,
    ...rest
  }: Props = $props();
</script>

<Button
  {variant}
  leadingIcon={icon}
  class={merge('h-9 w-9 shrink-0 p-0', className)}
  aria-label={label}
  disableTracking={true}
  data-track-name="icon-button"
  data-track-intent="{variant}-{icon}"
  data-track-text={label}
  {onclick}
  {...rest as ButtonWithoutHrefProps}
/>

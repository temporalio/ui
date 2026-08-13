<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import type { ComponentProps } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Button, {
    type ButtonWithoutHrefProps,
  } from '$lib/holocene/button.svelte';
  import type { IconComponent } from '$lib/io/icon';

  interface Props extends Omit<HTMLButtonAttributes, 'onclick'> {
    Icon: IconComponent;
    'data-testid'?: string;
    label: string;
    variant?: 'primary' | 'secondary' | 'ghost';
    class?: string;
    size?: ComponentProps<typeof Button>['size'];
    onclick?: (event: MouseEvent) => void;
  }

  let {
    class: className = '',
    Icon,
    label,
    variant = 'ghost',
    size = 'sm',
    onclick,
    ...rest
  }: Props = $props();
</script>

<Button
  {variant}
  {size}
  LeadingIcon={Icon}
  class={merge('aspect-square w-auto shrink-0 p-0', className)}
  aria-label={label}
  disableTracking={true}
  data-track-name="icon-button"
  data-track-intent="{variant}-{label}"
  data-track-text={label}
  {onclick}
  {...rest as ButtonWithoutHrefProps}
/>

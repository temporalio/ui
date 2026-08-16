<script lang="ts">
  import { MediaQuery } from 'svelte/reactivity';
  import { fly } from 'svelte/transition';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Button from '$lib/holocene/button.svelte';
  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ToastVariant } from '$lib/types/holocene';

  interface Props {
    id: string;
    variant: ToastVariant;
    closeButtonLabel?: string;
    onDismiss: (id: string) => void;
    children: Snippet;
  }

  let {
    id,
    variant,
    closeButtonLabel = '',
    onDismiss,
    children,
  }: Props = $props();

  const variants: Readonly<Record<ToastVariant, string>> = {
    primary: 'surface-inverse border-subtle',
    success: 'surface-primary border-success',
    error: 'surface-primary border-danger',
    info: 'surface-primary border-information',
    warning: 'surface-primary border-warning',
  };

  const variantIcon: Readonly<Record<ToastVariant, IconName | null>> = {
    primary: null,
    success: 'success',
    error: 'error',
    info: 'info',
    warning: 'warning',
  };

  const dismissLabel = $derived(closeButtonLabel || translate('common.close'));
  const icon = $derived(variantIcon[variant]);
  const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');

  const handleDismiss = (e: Event) => {
    e.stopPropagation();
    onDismiss(id);
  };
</script>

<div
  {id}
  class={merge(
    'flex grow-0 items-center justify-between gap-3 rounded-overlay border-l-2 px-3 py-2 shadow-floating',
    variants[variant],
  )}
  transition:fly={{
    x: reducedMotion.current ? 0 : 16,
    duration: reducedMotion.current ? 0 : 140,
  }}
>
  {#if icon}
    <Icon name={icon} class="shrink-0" />
  {/if}
  <p class="text-sm">
    {@render children()}
  </p>
  <Button
    variant="ghost"
    leadingIcon="close"
    aria-label={dismissLabel}
    class="text-inherit h-6 w-6 shrink-0 p-0"
    disableTracking
    onclick={handleDismiss}
  />
</div>

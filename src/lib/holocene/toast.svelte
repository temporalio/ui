<script lang="ts">
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
    primary: 'bg-io-indigo-8 text-io-content-white',
    success: 'bg-io-surface-success text-io-content-primary',
    error: 'bg-io-surface-danger text-io-content-primary',
    info: 'bg-io-surface-information text-io-content-primary',
    warning: 'bg-io-surface-warning text-io-content-primary',
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

  const handleDismiss = (e: Event) => {
    e.stopPropagation();
    onDismiss(id);
  };
</script>

<div
  {id}
  class={merge(
    'flex grow-0 items-center justify-between gap-4 rounded-md px-3 py-2.5 shadow',
    variants[variant],
  )}
  transition:fly={{ x: 250 }}
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

<script lang="ts">
  import { fly } from 'svelte/transition';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    IconCheckmark,
    IconClose,
    type IconComponent,
    IconExclamationCircle,
    IconInfo,
    IconWarning,
  } from '$lib/io/icon';
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
    primary: 'bg-surface-brand text-primary',
    success: 'bg-surface-success text-primary',
    error: 'bg-surface-danger text-primary',
    info: 'bg-surface-information text-primary',
    warning: 'bg-surface-warning text-primary',
  };

  const variantIcon: Readonly<Record<ToastVariant, IconComponent | null>> = {
    primary: null,
    success: IconCheckmark,
    error: IconExclamationCircle,
    info: IconInfo,
    warning: IconWarning,
  };

  const dismissLabel = $derived(closeButtonLabel || translate('common.close'));
  const Icon = $derived(variantIcon[variant]);

  const handleDismiss = (e: Event) => {
    e.stopPropagation();
    onDismiss(id);
  };
</script>

<div
  {id}
  class={merge(
    'flex grow-0 items-center justify-between gap-4 rounded-lg border border-primary px-3 py-2.5 shadow',
    variants[variant],
  )}
  transition:fly={{ x: 250 }}
>
  {#if Icon}
    <Icon class="shrink-0" />
  {/if}
  <p class="text-sm">
    {@render children()}
  </p>
  <Button
    variant="ghost"
    size="sm"
    LeadingIcon={IconClose}
    aria-label={dismissLabel}
    class="h-6 w-6 shrink-0 p-0 text-inherit"
    disableTracking
    onclick={handleDismiss}
  />
</div>

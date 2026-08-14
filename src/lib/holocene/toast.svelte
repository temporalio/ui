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
    primary: 'bg-slate-800 text-white',
    success: 'bg-success',
    error: 'bg-danger',
    info: 'bg-information',
    warning: 'bg-warning',
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
    'flex grow-0 items-center justify-between gap-4 rounded-md px-3 py-2.5 shadow',
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
    class="text-inherit h-6 w-6 shrink-0 p-0"
    disableTracking
    onclick={handleDismiss}
  />
</div>

<script lang="ts">
  import { fly } from 'svelte/transition';

  import { createEventDispatcher } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Button from '$lib/holocene/button.svelte';
  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ToastVariant } from '$lib/types/holocene';

  const dispatch = createEventDispatcher<{ dismiss: { id: string } }>();

  const variants: Readonly<Record<ToastVariant, string>> = {
    primary: 'bg-slate-800 text-white',
    success: 'bg-success',
    error: 'bg-danger',
    info: 'bg-information',
    warning: 'bg-warning',
  };

  const variantIcon: Readonly<Record<ToastVariant, IconName | null>> = {
    primary: null,
    success: 'success',
    error: 'error',
    info: 'info',
    warning: 'warning',
  };

  export let id: string;
  export let variant: keyof typeof variants;
  export let closeButtonLabel: string = '';

  $: dismissLabel = closeButtonLabel || translate('common.close');
  $: icon = variantIcon[variant];

  const handleDismiss = (e: Event) => {
    e.stopPropagation();
    dispatch('dismiss', { id });
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
    <slot />
  </p>
  <Button
    variant="ghost"
    leadingIcon="close"
    aria-label={dismissLabel}
    class="text-inherit h-6 w-6 shrink-0 p-0"
    disableTracking
    on:click={handleDismiss}
  />
</div>

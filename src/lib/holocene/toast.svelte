<script lang="ts">
  import { fly } from 'svelte/transition';

  import { createEventDispatcher } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { ToastVariant } from '$lib/types/holocene';

  const dispatch = createEventDispatcher<{ dismiss: { id: string } }>();

  const variants: Readonly<Record<ToastVariant, string>> = {
    primary: 'bg-slate-800 text-white',
    success: 'bg-success',
    error: 'bg-danger',
    info: 'bg-information',
    warning: 'bg-warning',
  };

  export let id: string;
  export let variant: keyof typeof variants;
  export let closeButtonLabel: string;

  const handleDismiss = () => {
    dispatch('dismiss', { id });
  };
</script>

<div
  {id}
  class={merge(
    'flex grow-0 items-center justify-between gap-4 rounded-md px-3 py-2.5 shadow-sm',
    variants[variant],
  )}
  transition:fly={{ x: 250 }}
>
  <p class="text-sm">
    <slot />
  </p>
  <button
    type="button"
    on:click|stopPropagation={handleDismiss}
    aria-label={closeButtonLabel}
  >
    <Icon name="close" />
  </button>
</div>

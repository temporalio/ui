<script lang="ts">
  import { fly } from 'svelte/transition';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { ToastVariant } from '$lib/types/holocene';

  const variants: Readonly<Record<ToastVariant, string>> = {
    primary: 'bg-slate-800 text-white',
    success: 'bg-success',
    error: 'bg-danger',
    info: 'bg-information',
    warning: 'bg-warning',
  };

  interface Props {
    id: string;
    variant: ToastVariant;
    closeButtonLabel: string;
    children?: Snippet;
    dismiss?: (args: { id: string }) => void;
  }

  let { id, variant, closeButtonLabel, children, dismiss }: Props = $props();

  const handleDismiss = (event: Event) => {
    event.stopPropagation();
    dismiss({ id });
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
  <p class="text-sm">
    {@render children?.()}
  </p>
  <button type="button" onclick={handleDismiss} aria-label={closeButtonLabel}>
    <Icon name="close" />
  </button>
</div>

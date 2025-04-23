<script lang="ts">
  import type { Writable } from 'svelte/store';

  import { cva } from 'class-variance-authority';

  import type { ToastPosition } from '$lib/types/holocene';

  import type { Toaster } from '../stores/toaster';

  import Link from './link.svelte';
  import ToastComponent from './toast.svelte';

  export let pop: Toaster['pop'];
  export let toasts: Toaster['toasts'];
  export let closeButtonLabel: string;
  export let position: Writable<ToastPosition>;

  const dismissToast = (event: CustomEvent<{ id: string }>) => {
    pop(event.detail.id);
  };

  const toast = cva(['fixed z-[99999] flex flex-col items-end gap-2'], {
    variants: {
      position: {
        'top-left': 'top-16 left-5',
        'top-center': 'top-16 left-1/2 -translate-x-1/2',
        'top-right': 'top-16 right-5',
        'bottom-left': 'bottom-5 left-5',
        'bottom-center': 'bottom-5 left-1/2 -translate-x-1/2',
        'bottom-right': 'bottom-5 right-5',
      },
    },
    defaultVariants: {
      position: $position,
    },
  });
</script>

<div class={toast({ position: $position })} role="log">
  {#each $toasts as { message, variant, id, link } (id)}
    <ToastComponent {closeButtonLabel} {variant} {id} on:dismiss={dismissToast}>
      {#if link}
        <Link href={link}>
          {message}
        </Link>
      {:else}
        {message}
      {/if}
    </ToastComponent>
  {/each}
</div>

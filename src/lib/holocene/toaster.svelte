<script lang="ts">
  import type { Writable } from 'svelte/store';

  import { cva } from 'class-variance-authority';

  import type { Announcement } from '$lib/stores/announcer';
  import {
    type Toaster as Toast,
    toaster as toasterStore,
  } from '$lib/stores/toaster';
  import type { ToastPosition } from '$lib/types/holocene';

  import Link from './link.svelte';
  import LiveRegion from './live-region.svelte';
  import ToastComponent from './toast.svelte';

  interface Props {
    pop: Toast['pop'];
    toasts: Toast['toasts'];
    closeButtonLabel: string;
    position: Writable<ToastPosition>;
    announcements?: Announcement[];
  }

  let { pop, toasts, closeButtonLabel, position, announcements }: Props =
    $props();

  const storeAnnouncements = toasterStore.announcements;
  const liveMessages = $derived(announcements ?? $storeAnnouncements);

  const dismissToast = (event: CustomEvent<{ id: string }>) => {
    pop(event.detail.id);
  };

  const toast = cva(['fixed z-[99999] flex flex-col items-end gap-2'], {
    variants: {
      position: {
        'top-left': 'top-16 left-5',
        'top-center': 'top-16 left-1/2 -translate-x-1/2 items-center',
        'top-right': 'top-16 right-5',
        'bottom-left': 'bottom-5 left-5',
        'bottom-center': 'bottom-5 left-1/2 -translate-x-1/2 items-center',
        'bottom-right': 'bottom-5 right-5',
      },
    },
    defaultVariants: {
      position: $position,
    },
  });
</script>

<div class={toast({ position: $position })}>
  <LiveRegion messages={liveMessages} />
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

<script lang="ts" module>
  import { writable, type Writable } from 'svelte/store';

  import { v4 } from 'uuid';

  export type ToastVariant =
    | 'success'
    | 'error'
    | 'info'
    | 'warning'
    | 'primary';

  export interface Toast {
    message: string;
    id?: string;
    variant?: ToastVariant;
    duration?: number;
    link?: string;
  }

  const toasts = writable<Toast[]>([]);

  interface Toaster extends Writable<Toast[]> {
    push: (toast: Toast) => void;
    pop: (id: string) => void;
    clear: () => void;
    toasts: Writable<Toast[]>;
  }

  const push = (toast: Toast) => {
    const toastWithDefaults: Toast = {
      id: v4(),
      duration: 3000,
      variant: 'primary',
      ...toast,
    };
    toasts.update((ts) => [...ts, toastWithDefaults]);
    const timeoutId = setTimeout(() => {
      pop(toastWithDefaults.id);
      clearTimeout(timeoutId);
    }, toastWithDefaults.duration);
  };

  const pop = (id: string) => {
    toasts.update((ts) => ts.filter((t) => t.id !== id));
  };

  const clear = (): void => {
    toasts.set([]);
  };

  export const toaster: Toaster = {
    push,
    pop,
    clear,
    toasts,
    set: toasts.set,
    subscribe: toasts.subscribe,
    update: toasts.update,
  };
</script>

<script lang="ts">
  import { fly } from 'svelte/transition';

  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';

  const variants: Readonly<Record<ToastVariant, string>> = {
    primary: 'bg-slate-800 text-white',
    success: 'bg-success',
    error: 'bg-danger',
    info: 'bg-information',
    warning: 'bg-warning',
  };

  interface Props {
    closeButtonLabel: string;
  }

  let { closeButtonLabel }: Props = $props();
</script>

{#snippet toast(t: Toast)}
  {@const { id, variant, message, link } = t}
  <div
    {id}
    class={merge(
      'flex grow-0 items-center justify-between gap-4 rounded-md px-3 py-2.5 shadow',
      variants[variant],
    )}
    transition:fly={{ x: 250 }}
  >
    <p class="text-sm">
      {#if link}
        <Link href={link}>
          {message}
        </Link>
      {:else}
        {message}
      {/if}
    </p>
    <button
      type="button"
      onclick={() => toaster.pop(id)}
      aria-label={closeButtonLabel}
    >
      <Icon name="close" />
    </button>
  </div>
{/snippet}

<div
  class="fixed bottom-5 right-5 z-[99999] flex flex-col items-end gap-2"
  role="log"
>
  {#each $toaster as t (t.id)}
    {@render toast(t)}
  {/each}
</div>

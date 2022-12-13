<script lang="ts" context="module">
  import { type Writable, writable } from 'svelte/store';
  import { v4 } from 'uuid';

  export type ToastVariant =
    | 'success'
    | 'error'
    | 'info'
    | 'warning'
    | 'primary';

  export interface Toast {
    message: string;
    variant?: ToastVariant;
    id?: string;
    duration?: number;
  }

  interface Toaster {
    push: (toast: Toast) => void;
    pop: (id: string) => void;
    toasts: Writable<Toast[]>;
  }

  const toasts = writable<Toast[]>([]);

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

  export const toaster: Toaster = {
    push,
    pop,
    toasts,
  };
</script>

<script lang="ts">
  import ToastComponent from './toast.svelte';

  export let pop: Toaster['pop'];
  export let toasts: Toaster['toasts'];

  const dismissToast = (event: CustomEvent<{ id: string }>) => {
    pop(event.detail.id);
  };
</script>

<div class="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
  {#each $toasts as { message, variant, id } (id)}
    <ToastComponent {variant} {id} on:dismiss={dismissToast}>
      {message}
    </ToastComponent>
  {/each}
</div>

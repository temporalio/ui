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
    xPosition?: 'left' | 'right';
    yPosition?: 'top' | 'bottom';
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
      xPosition: 'right',
      yPosition: 'top',
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

  $: topRightToasts = $toasts.filter(
    (toast) => toast.yPosition === 'top' && toast.xPosition === 'right',
  );
  $: bottomRightToasts = $toasts
    .filter(
      (toast) => toast.yPosition === 'bottom' && toast.xPosition === 'right',
    )
    .reverse();
  $: bottomLeftToasts = $toasts
    .filter(
      (toast) => toast.yPosition === 'bottom' && toast.xPosition === 'left',
    )
    .reverse();
  $: topLeftToasts = $toasts.filter(
    (toast) => toast.yPosition === 'top' && toast.xPosition === 'left',
  );
</script>

<div class="toast-container top-5 right-5">
  {#each topRightToasts as { message, variant, id } (id)}
    <ToastComponent {variant} {id} on:dismiss={dismissToast}>
      {message}
    </ToastComponent>
  {/each}
</div>
<div class="toast-container bottom-5 right-5">
  {#each bottomRightToasts as { message, variant, id } (id)}
    <ToastComponent {variant} {id} on:dismiss={dismissToast}>
      {message}
    </ToastComponent>
  {/each}
</div>
<div class="toast-container bottom-5 left-5">
  {#each bottomLeftToasts as { message, variant, id } (id)}
    <ToastComponent {variant} {id} on:dismiss={dismissToast}>
      {message}
    </ToastComponent>
  {/each}
</div>
<div class="toast-container top-5 left-5">
  {#each topLeftToasts as { message, variant, id } (id)}
    <ToastComponent {variant} {id} on:dismiss={dismissToast}>
      {message}
    </ToastComponent>
  {/each}
</div>

<style lang="postcss">
  .toast-container {
    @apply fixed z-50 flex flex-col items-end gap-2;
  }
</style>

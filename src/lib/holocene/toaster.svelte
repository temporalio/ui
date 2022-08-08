<script lang="ts" context="module">
  import { Writable, writable } from 'svelte/store';
  import { v4 } from 'uuid';

  interface Toast {
    message: string;
    variant: 'success' | 'error' | 'info' | 'warning' | 'primary';
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
    const id = toast.id ?? v4();
    const duration = toast.duration ?? 3000;
    toasts.update((ts) => [...ts, { id, ...toast }]);
    const timeoutId = setTimeout(() => {
      pop(id);
      clearTimeout(timeoutId);
    }, duration);
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
  import IconButton from '$holocene/icon-button.svelte';
  import { crossfade, fly } from 'svelte/transition';
  import { cubicInOut } from 'svelte/easing';
  import { flip } from 'svelte/animate';

  export let pop: Toaster['pop'];
  export let toasts: Toaster['toasts'];

  const [send, receive] = crossfade({
    duration: 500,
    easing: cubicInOut,
    fallback: (node) => fly(node, { x: 250, duration: 250 }),
  });
</script>

<div class="absolute top-4 right-4 flex flex-col items-end gap-2">
  {#each $toasts as { message, variant, id: key } (key)}
    <article
      class="flex grow-0 items-center justify-between gap-4 rounded py-3 px-4 shadow {variant}"
      in:send={{ key }}
      out:receive={{ key }}
      animate:flip={{ duration: (d) => Math.sqrt(d * 200) }}
    >
      <p class="font-secondary text-sm">{message}</p>
      <IconButton
        scale={1.25}
        stroke="currentcolor"
        icon="close"
        on:click={() => pop(key)}
      />
    </article>
  {/each}
</div>

<style lang="postcss">
  .primary {
    @apply bg-primary text-white;
  }

  .success {
    @apply bg-green-50 text-green-900;
  }

  .error {
    @apply bg-red-50 text-red-900;
  }

  .info {
    @apply bg-blue-50 text-blue-900;
  }

  .warning {
    @apply bg-yellow-50 text-yellow-900;
  }
</style>

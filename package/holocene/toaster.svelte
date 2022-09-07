<script context="module">import { writable } from 'svelte/store';
import { v4 } from 'uuid';
const toasts = writable([]);
const push = (toast) => {
    var _a, _b;
    const id = (_a = toast.id) !== null && _a !== void 0 ? _a : v4();
    const duration = (_b = toast.duration) !== null && _b !== void 0 ? _b : 3000;
    toasts.update((ts) => [...ts, { id, ...toast }]);
    const timeoutId = setTimeout(() => {
        pop(id);
        clearTimeout(timeoutId);
    }, duration);
};
const pop = (id) => {
    toasts.update((ts) => ts.filter((t) => t.id !== id));
};
export const toaster = {
    push,
    pop,
    toasts,
};
</script>

<script>import IconButton from '$holocene/icon-button.svelte';
import { crossfade, fly } from 'svelte/transition';
import { cubicInOut } from 'svelte/easing';
import { flip } from 'svelte/animate';
export let pop;
export let toasts;
const [send, receive] = crossfade({
    duration: 500,
    easing: cubicInOut,
    fallback: (node) => fly(node, { x: 250, duration: 250 }),
});
</script>

<div class="absolute top-4 right-4 z-50 flex flex-col items-end gap-2">
  {#each $toasts as { message, variant, id: key } (key)}
    <article
      class="flex grow-0 items-center justify-between gap-4 rounded py-3 px-4 shadow {variant}"
      in:send={{ key }}
      out:receive={{ key }}
      animate:flip={{ duration: (d) => Math.sqrt(d * 200) }}
    >
      <p class="font-secondary text-sm">{message}</p>
      <IconButton icon="close" on:click={() => pop(key)} />
    </article>
  {/each}
</div>

<style>
  .primary {

    --tw-bg-opacity: 1;

    background-color: rgb(24 24 27 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(255 255 255 / var(--tw-text-opacity))
}

  .success {

    --tw-bg-opacity: 1;

    background-color: rgb(240 253 244 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(20 83 45 / var(--tw-text-opacity))
}

  .error {

    --tw-bg-opacity: 1;

    background-color: rgb(254 242 242 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(127 29 29 / var(--tw-text-opacity))
}

  .info {

    --tw-bg-opacity: 1;

    background-color: rgb(239 246 255 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(30 58 138 / var(--tw-text-opacity))
}

  .warning {

    --tw-bg-opacity: 1;

    background-color: rgb(254 252 232 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(113 63 18 / var(--tw-text-opacity))
}</style>

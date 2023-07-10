<script lang="ts">
  import type { Toaster } from '../stores/toaster';
  
  import ToastComponent from './toast.svelte';

  export let pop: Toaster['pop'];
  export let toasts: Toaster['toasts'];

  const dismissToast = (event: CustomEvent<{ id: string }>) => {
    pop(event.detail.id);
  };
</script>

<div
  class="fixed bottom-5 right-5 z-[99999] flex flex-col items-end gap-2"
  role="log"
>
  {#each $toasts as { message, variant, id } (id)}
    <ToastComponent {variant} {id} on:dismiss={dismissToast}>
      {message}
    </ToastComponent>
  {/each}
</div>

<script lang="ts">
  import type { Toaster } from '../stores/toaster';

  import Link from './link.svelte';
  import ToastComponent from './toast.svelte';

  interface Props {
    pop: Toaster['pop'];
    toasts: Toaster['toasts'];
    closeButtonLabel: string;
  }

  let { pop, toasts, closeButtonLabel }: Props = $props();

  const dismissToast = ({ id }: { id: string }) => {
    pop(id);
  };
</script>

<div
  class="fixed bottom-5 right-5 z-[99999] flex flex-col items-end gap-2"
  role="log"
>
  {#each $toasts as { message, variant, id, link } (id)}
    <ToastComponent {closeButtonLabel} {variant} {id} dismiss={dismissToast}>
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

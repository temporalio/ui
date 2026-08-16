<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { ComponentProps, Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Button from '$lib/holocene/button.svelte';

  import IconButton from './icon-button.svelte';

  interface Props extends HTMLAttributes<HTMLDialogElement> {
    cancelText: string;
    confirmDisabled?: boolean;
    confirmText: string;
    confirmType?: ComponentProps<typeof Button>['variant'];
    hideCancel?: boolean;
    hideConfirm?: boolean;
    hightlightNav?: boolean;
    id: string;
    large?: boolean;
    loading?: boolean;
    open: boolean;
    error?: string;
    class?: string;
    titleSnippet?: Snippet;
    content?: Snippet;
    footer?: Snippet;
    onCancelModal?: () => void;
    onConfirmModal?: () => void;
  }

  let {
    hideCancel = false,
    hideConfirm = false,
    confirmText,
    cancelText,
    confirmType = 'primary',
    confirmDisabled = false,
    large = false,
    loading = false,
    hightlightNav = false,
    id,
    open = $bindable(),
    error = $bindable(''),
    class: className = '',
    titleSnippet,
    content,
    footer,
    onCancelModal,
    onConfirmModal,
    ...rest
  }: Props = $props();

  let modalElement = $state<HTMLDialogElement>();

  const toggleModal = (open: boolean, modal: HTMLDialogElement | undefined) => {
    if (open) {
      modal?.showModal();
    } else {
      modal?.close();
    }
  };

  $effect(() => {
    toggleModal(open, modalElement);
  });

  // Escape, backdrop, the close icon, the cancel button and the parent flipping
  // `open` all end up here via the dialog's native close event.
  const handleClose = () => {
    error = '';
    if (!open) return; // the parent already closed us, the user did not cancel
    open = false;
    onCancelModal?.();
  };

  const confirmModal = () => {
    onConfirmModal?.();
  };

  const closeModal = () => {
    modalElement?.close();
  };

  const handleClick = (event: MouseEvent) => {
    if (event.target === modalElement) closeModal();
  };

  $effect(() => {
    if (open && modalElement) {
      modalElement.focus();
    }
  });
</script>

<svelte:window onclick={handleClick} />

<dialog
  {id}
  onclose={handleClose}
  bind:this={modalElement}
  class={merge(
    'body',
    'transition-[opacity,transform] duration-normal ease-standard',
    open && 'scale-100 opacity-100',
    !open && 'scale-95 opacity-0',
    className,
  )}
  class:large
  class:hightlightNav
  aria-modal="true"
  aria-labelledby="modal-title-{id}"
  {...rest}
>
  {#if !loading}
    <IconButton
      label={cancelText}
      icon="close"
      class="float-right m-3"
      onclick={closeModal}
    />
  {/if}
  <div id="modal-title-{id}" class="title">
    {@render titleSnippet?.()}
  </div>
  <form
    onsubmit={(event) => {
      event.preventDefault();
      confirmModal();
    }}
    method="dialog"
  >
    <div id="modal-content-{id}" class="content">
      {@render content?.()}
      <p
        class="mt-2 text-sm font-normal text-danger"
        class:hidden={!error}
        role="alert"
      >
        {error}
      </p>
    </div>

    <div
      class="flex items-center justify-between gap-3 border-t border-subtle px-4 py-3 sm:px-5"
    >
      {#if footer}
        {@render footer()}
      {:else}
        <div></div>
      {/if}
      <div class="flex items-center justify-end space-x-2">
        {#if !hideCancel}
          <Button
            data-testid="cancel-modal-button"
            variant="ghost"
            disabled={loading}
            onclick={closeModal}>{cancelText}</Button
          >
        {/if}
        {#if !hideConfirm}
          <Button
            variant={confirmType}
            {loading}
            disabled={confirmDisabled || loading}
            data-testid="confirm-modal-button"
            type="submit">{confirmText}</Button
          >
        {/if}
      </div>
    </div>
  </form>
</dialog>

<style lang="postcss">
  .body {
    @apply surface-primary z-modal w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-overlay border border-subtle p-0 text-primary shadow-modal md:h-max;

    max-height: calc(100dvh - 2rem);
  }

  .body::backdrop {
    @apply cursor-pointer bg-slate-950/60 transition-opacity duration-normal;

    :global([data-theme='dark']) & {
      background-color: rgb(var(--color-surface-background) / 50%);
    }
  }

  .body.hightlightNav::backdrop {
    @apply left-[60px] top-[40px];
  }

  .large {
    @apply lg:max-w-3xl;
  }

  .title {
    @apply surface-primary px-4 pb-0 pt-4 text-lg font-semibold tracking-tight sm:px-5 sm:pt-5;
  }

  .content {
    @apply whitespace-normal px-4 pb-4 pt-3 sm:px-5 sm:pb-5;
  }
</style>

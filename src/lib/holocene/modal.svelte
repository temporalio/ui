<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { ComponentProps, Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Button from '$lib/holocene/button.svelte';
  import { IconClose } from '$lib/io/icon';

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
    'transition-all duration-200 ease-out',
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
      Icon={IconClose}
      class="float-right m-4"
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

    <div class="flex items-center justify-between p-6">
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
    @apply surface-primary z-50 w-full max-w-lg overflow-y-auto border border-secondary p-0 text-primary shadow-xl md:h-max;
  }

  .body::backdrop {
    @apply cursor-pointer bg-black/50 transition-opacity duration-200;

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
    @apply surface-primary px-8 pb-0 pt-8 text-2xl;
  }

  .content {
    @apply whitespace-normal p-8;
  }
</style>

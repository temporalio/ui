<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { type ComponentProps, type Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Button from '$lib/anthropocene/button.svelte';
  import { focusTrap } from '$lib/utilities/focus-trap';

  import IconButton from './icon-button.svelte';

  interface Props extends HTMLAttributes<HTMLDialogElement> {
    cancelText: string;
    confirmDisabled?: boolean;
    confirmText: string;
    confirmType?: ComponentProps<Button>['variant'];
    hideConfirm?: boolean;
    hightlightNav?: boolean;
    id: string;
    large?: boolean;
    loading?: boolean;
    'data-testid'?: string;
    open: boolean;
    error?: string;
    class?: string;
    title?: Snippet;
    content?: Snippet;
    oncancelModal?: () => void;
    onconfirmModal?: () => void;
  }

  let {
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
    title,
    content,
    oncancelModal,
    onconfirmModal,
    ...restProps
  }: Props = $props();

  let modalElement: HTMLDialogElement;

  $effect(() => {
    toggleModal(open, modalElement);
  });

  export const toggleModal = (open: boolean, modal: HTMLDialogElement) => {
    if (open) {
      modal?.showModal();
    } else {
      modal?.close();
    }
  };

  const handleCancel = () => {
    oncancelModal?.();
    open = false;
    error = '';
  };

  const confirmModal = () => {
    onconfirmModal?.();
  };

  const closeModal = () => {
    open = false;
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
  onclose={handleCancel}
  bind:this={modalElement}
  class={merge('body', className)}
  class:large
  class:hightlightNav
  aria-modal="true"
  aria-labelledby="modal-title-{id}"
  data-testid={restProps['data-testid']}
  {...restProps}
  use:focusTrap={true}
>
  {#if !loading}
    <IconButton
      label={cancelText}
      icon="close"
      class="float-right m-4"
      onclick={closeModal}
    />
  {/if}
  <div id="modal-title-{id}" class="title">
    {#if title}
      {@render title()}
    {/if}
  </div>
  <form
    onsubmit={(e) => {
      e.preventDefault();
      confirmModal();
    }}
    method="dialog"
  >
    <div id="modal-content-{id}" class="content">
      {#if content}
        {@render content()}
      {/if}
      <p
        class="mt-2 text-sm font-normal text-danger"
        class:hidden={!error}
        role="alert"
      >
        {error}
      </p>
    </div>
    <div class="flex items-center justify-end space-x-2 p-6">
      <Button variant="ghost" disabled={loading} onclick={closeModal}
        >{cancelText}</Button
      >
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
  </form>
</dialog>

<style lang="postcss">
  .body {
    @apply surface-primary z-50 w-full max-w-lg overflow-y-auto border border-secondary p-0 text-primary shadow-xl md:h-max;
  }

  .body::backdrop {
    @apply cursor-pointer;
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

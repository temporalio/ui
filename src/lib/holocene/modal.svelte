<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  
  import { type ComponentProps, createEventDispatcher } from 'svelte';
  
  import Button from '$lib/holocene/button.svelte';
  
  import IconButton from './icon-button.svelte';

  interface $$Props extends HTMLAttributes<HTMLDialogElement> {
    cancelText?: string;
    confirmDisabled?: boolean;
    confirmText?: string;
    confirmType?: ComponentProps<Button>['variant'];
    hideConfirm?: boolean;
    hightlightNav?: boolean;
    id: string;
    large?: boolean;
    loading?: boolean;
    'data-testid'?: string;
  }

  export let hideConfirm = false;
  export let confirmText = 'Confirm';
  export let cancelText = 'Cancel';
  export let confirmType: ComponentProps<Button>['variant'] = 'primary';
  export let confirmDisabled = false;
  export let large = false;
  export let loading = false;
  export let hightlightNav = false;
  export let id: string;

  let error: string;

  export const open = () => modalElement.showModal();

  export const close = () => {
    error = '';
    modalElement.close();
  };

  export const setError = (err: string) => {
    error = err;
  };

  let className = '';
  export { className as class };

  let modalElement: HTMLDialogElement;

  const dispatch = createEventDispatcher<{
    cancelModal: undefined;
    confirmModal: undefined;
  }>();

  const handleCancel = () => {
    close();
    dispatch('cancelModal');
  };

  const confirmModal = () => {
    error = '';
    dispatch('confirmModal');
  };

  const handleKeyboardNavigation = (event: KeyboardEvent) => {
    if (!open) {
      return;
    }

    const focusable = Array.from(
      modalElement.querySelectorAll<
        HTMLButtonElement | HTMLInputElement | HTMLDivElement
      >('button, input, div[contenteditable="true"]'),
    ).filter((element) => {
      if (element instanceof HTMLDivElement) return element.isContentEditable;
      return !element.disabled;
    });
    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          event.preventDefault();
        }
      } else if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        event.preventDefault();
      }
    }
  };

  const handleClick = (event: MouseEvent) => {
    if (event.target === modalElement) handleCancel();
  };

  $: {
    if (open && modalElement) {
      modalElement.focus();
    }
  }
</script>

<svelte:window
  on:click={handleClick}
  on:keydown|stopPropagation={handleKeyboardNavigation}
/>
<dialog
  {id}
  bind:this={modalElement}
  class="body {className}"
  class:large
  class:hightlightNav
  aria-modal="true"
  aria-labelledby="modal-title"
  data-testid={$$props['data-testid']}
  {...$$restProps}
>
  {#if !loading}
    <IconButton
      aria-label={cancelText}
      icon="close"
      class="float-right m-4"
      on:click={handleCancel}
    />
  {/if}
  <div id="modal-title-{id}" class="title">
    <slot name="title">
      <h3>Title</h3>
    </slot>
  </div>
  <form on:submit|preventDefault={confirmModal} method="dialog">
    <div id="modal-content-{id}" class="content">
      <slot name="content">
        <span>Content</span>
      </slot>
      {#if error}
        <p class="mt-2 text-sm font-normal text-danger">{error}</p>
      {/if}
    </div>
    <div class="flex items-center justify-end space-x-2 p-6">
      <Button
        thin
        variant="secondary"
        disabled={loading}
        on:click={handleCancel}>{cancelText}</Button
      >
      {#if !hideConfirm}
        <Button
          thin
          variant={confirmType}
          {loading}
          disabled={confirmDisabled || loading}
          testId="confirm-modal-button"
          type="submit">{confirmText}</Button
        >
      {/if}
    </div>
  </form>
</dialog>

<style lang="postcss">
  .body {
    @apply z-50  w-full max-w-lg overflow-y-auto rounded-lg bg-white p-0 text-gray-900 shadow-xl md:h-max;
  }

  .body::backdrop {
    @apply cursor-pointer bg-gray-900 opacity-70;
  }

  .body.hightlightNav::backdrop {
    @apply top-[40px] left-[60px];
  }

  .large {
    @apply lg:w-1/2;
  }

  .title {
    @apply bg-white px-8 pt-8 pb-0 text-2xl;
  }

  .content {
    @apply whitespace-normal p-8;
  }
</style>

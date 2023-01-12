<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/holocene/button.svelte';

  export let open: boolean = false;
  export let hideConfirm: boolean = false;
  export let confirmText: string = 'Confirm';
  export let cancelText: string = 'Cancel';
  export let confirmType: 'destructive' | 'primary' = 'primary';
  export let confirmDisabled: boolean = false;
  export let large: boolean = false;
  export let loading: boolean = false;

  let modalElement: HTMLDivElement;

  const dispatch = createEventDispatcher<{
    cancelModal: undefined;
    confirmModal: undefined;
  }>();

  const cancelModal = () => {
    dispatch('cancelModal');
  };

  const handleKeyboardNavigation = (event: KeyboardEvent) => {
    if (!open) {
      return;
    }

    if (event.key === 'Escape') {
      cancelModal();
      return;
    }

    const focusable = modalElement.querySelectorAll('button');
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

  $: {
    if (open && modalElement) {
      modalElement.focus();
    }
  }
</script>

<svelte:window on:keydown|stopPropagation={handleKeyboardNavigation} />
{#if open}
  <div class="modal">
    <div on:click={cancelModal} class="overlay" />
    <div
      bind:this={modalElement}
      class="body"
      class:large
      tabindex="-1"
      role="alertdialog"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      {#if !loading}
        <button
          aria-label={cancelText}
          class="float-right m-4"
          on:click={cancelModal}
        >
          <Icon
            name="close"
            class="cursor-pointer rounded-full hover:bg-gray-900 hover:text-white"
          />
        </button>
      {/if}
      <div id="modal-title" class="title">
        <slot name="title">
          <h3>Title</h3>
        </slot>
      </div>
      <div id="modal-content" class="content">
        <slot name="content">
          <span>Content</span>
        </slot>
      </div>
      <div class="flex items-center justify-end space-x-2 p-6">
        <Button
          thin
          variant="secondary"
          disabled={loading}
          on:click={cancelModal}>{cancelText}</Button
        >
        {#if !hideConfirm}
          <Button
            thin
            variant={confirmType}
            {loading}
            disabled={confirmDisabled || loading}
            dataCy="confirm-modal-button"
            on:click={() => dispatch('confirmModal')}>{confirmText}</Button
          >
        {/if}
      </div>
    </div>
  </div>
{/if}

<style lang="postcss">
  .modal {
    @apply fixed top-0 left-0 z-50 flex h-full w-full cursor-default items-center justify-center p-8 lg:p-0;
  }

  .overlay {
    @apply fixed h-full w-full bg-gray-900 opacity-50;
  }

  .body {
    @apply z-50 mx-auto w-full max-w-lg overflow-y-auto rounded-lg bg-white text-gray-900 shadow-xl md:h-max;
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

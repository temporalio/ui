<script lang="ts">
  import Icon from '$holocene/icon/icon.svelte';
  import { createEventDispatcher } from 'svelte';
  import Button from '$holocene/button.svelte';

  export let open: boolean = false;
  export let hideConfirm: boolean = false;
  export let confirmText: string = 'Confirm';
  export let cancelText: string = 'Cancel';
  export let confirmType: 'destructive' | 'primary' = 'primary';
  export let confirmDisabled: boolean = false;
  export let large: boolean = false;
  export let loading: boolean = false;

  let closeButton: HTMLButtonElement;
  let cancelButton: Button;
  let confirmButton: Button;

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

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === closeButton) {
          confirmButton.focus();
          event.preventDefault();
        }
      } else if (document.activeElement === confirmButton.buttonElement) {
        closeButton.focus();
        event.preventDefault();
      }
    }
  };
</script>

<svelte:window on:keydown={handleKeyboardNavigation} />
{#if open}
  <div class="modal">
    <div on:click={cancelModal} class="overlay" />
    <div class="body" class:large>
      {#if !loading}
        <button
          bind:this={closeButton}
          class="float-right m-4"
          on:click={cancelModal}
        >
          <Icon
            name="close"
            class="cursor-pointer rounded-full hover:bg-gray-900 hover:text-white"
          />
        </button>
      {/if}
      <div class="title">
        <slot name="title">
          <h3>Title</h3>
        </slot>
      </div>
      <div class="content">
        <slot name="content">
          <span>Content</span>
        </slot>
      </div>
      <div class="flex items-center justify-end space-x-2 p-6">
        <Button
          bind:this={cancelButton}
          thin
          variant="secondary"
          disabled={loading}
          on:click={cancelModal}>{cancelText}</Button
        >
        {#if !hideConfirm}
          <Button
            bind:this={confirmButton}
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
    @apply p-8;
  }
</style>

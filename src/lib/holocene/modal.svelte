<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { type ComponentProps, createEventDispatcher } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Button from '$lib/holocene/button.svelte';
  import { focusTrap } from '$lib/utilities/focus-trap';

  import IconButton from './icon-button.svelte';

  interface $$Props extends HTMLAttributes<HTMLDialogElement> {
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
  }

  export let hideConfirm = false;
  export let confirmText: string;
  export let cancelText: string;
  export let confirmType: ComponentProps<Button>['variant'] = 'primary';
  export let confirmDisabled = false;
  export let large = false;
  export let loading = false;
  export let hightlightNav = false;
  export let id: string;
  export let open: boolean;
  export let error = '';

  let className = '';
  export { className as class };

  let modalElement: HTMLDialogElement;

  $: toggleModal(open, modalElement);

  export const toggleModal = (open: boolean, modal: HTMLDialogElement) => {
    if (open) {
      modal?.showModal();
    } else {
      modal?.close();
    }
  };

  const dispatch = createEventDispatcher<{
    cancelModal: undefined;
    confirmModal: undefined;
  }>();

  const handleCancel = () => {
    dispatch('cancelModal');
    open = false;
    error = '';
  };

  const confirmModal = () => {
    dispatch('confirmModal');
  };

  const closeModal = () => {
    open = false;
  };

  const handleClick = (event: MouseEvent) => {
    if (event.target === modalElement) closeModal();
  };

  $: {
    if (open && modalElement) {
      modalElement.focus();
    }
  }
</script>

<svelte:window on:click={handleClick} />

<dialog
  {id}
  on:close={handleCancel}
  bind:this={modalElement}
  class={merge('body', className)}
  class:large
  class:hightlightNav
  aria-modal="true"
  aria-labelledby="modal-title-{id}"
  data-testid={$$props['data-testid']}
  {...$$restProps}
  use:focusTrap={true}
>
  {#if !loading}
    <IconButton
      label={cancelText}
      icon="close"
      class="float-right m-4"
      on:click={closeModal}
    />
  {/if}
  <div id="modal-title-{id}" class="title">
    <slot name="modalTitle" />
  </div>
  <form on:submit|preventDefault={confirmModal} method="dialog">
    <div id="modal-content-{id}" class="content">
      <slot name="content" />
      <p
        class="mt-2 text-sm font-normal text-danger"
        class:hidden={!error}
        role="alert"
      >
        {error}
      </p>
    </div>
    <div class="flex items-center justify-end space-x-2 p-6">
      <Button variant="ghost" disabled={loading} on:click={closeModal}
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

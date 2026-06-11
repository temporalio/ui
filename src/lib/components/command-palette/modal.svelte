<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import IconButton from '$lib/holocene/icon-button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { focusTrap } from '$lib/utilities/focus-trap';

  interface Props extends HTMLAttributes<HTMLDialogElement> {
    content: Snippet;
    cancelText?: string;
    hightlightNav?: boolean;
    id: string;
    loading?: boolean;
    'data-testid'?: string;
    open: boolean;
    error?: string;
    class?: string;
  }

  let {
    content,
    cancelText = translate('common.cancel'),
    hightlightNav = false,
    id,
    loading = false,
    'data-testid': dataTestId,
    open = $bindable(),
    error = '',
    class: className,
  }: Props = $props();

  export { className as class };

  let modalElement: HTMLDialogElement;

  const toggleModal = (open: boolean, modal: HTMLDialogElement) => {
    if (open) {
      modal?.showModal();
    } else {
      modal?.close();
    }
  };

  const handleCancel = () => {
    open = false;
    error = '';
  };

  const closeModal = () => {
    open = false;
  };

  const handleClick = (event: MouseEvent) => {
    if (event.target === modalElement) closeModal();
  };

  $effect(() => {
    toggleModal(open, modalElement);
  });
</script>

<svelte:window on:click={handleClick} />

<dialog
  {id}
  onclose={handleCancel}
  bind:this={modalElement}
  class={merge('body', className)}
  class:hightlightNav
  aria-modal="true"
  aria-labelledby="modal-title-{id}"
  data-testid={dataTestId}
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
</dialog>

<style lang="postcss">
  .body {
    @apply surface-primary z-50 w-full overflow-y-auto rounded-sm border border-secondary p-0 text-primary shadow-xl md:h-max lg:max-w-4xl;
  }

  .body::backdrop {
    @apply cursor-pointer;
  }

  .body.hightlightNav::backdrop {
    @apply left-[60px] top-[40px];
  }

  .title {
    @apply surface-primary px-8 pb-0 pt-8 text-2xl;
  }

  .content {
    @apply whitespace-normal;
  }
</style>

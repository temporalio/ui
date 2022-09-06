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

  const dispatch = createEventDispatcher();
</script>

{#if open}
  <div class="modal">
    <div class="overlay" />
    <div class="body" class:large>
      <div
        class="float-right cursor-pointer p-6"
        on:click={() => dispatch('cancelModal', {})}
      >
        <Icon name="close" />
      </div>
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
          thin
          variant="secondary"
          on:click={() => dispatch('cancelModal', {})}>{cancelText}</Button
        >
        {#if !hideConfirm}
          <Button
            thin
            variant={confirmType}
            disabled={confirmDisabled}
            on:click={() => dispatch('confirmModal', {})}>{confirmText}</Button
          >
        {/if}
      </div>
    </div>
  </div>
{/if}

<style lang="postcss">
  .modal {
    @apply fixed top-0 left-0 z-50 flex h-full w-full items-center justify-center p-8 lg:p-0;
  }

  .overlay {
    @apply fixed h-full w-full bg-gray-900 opacity-50;
  }

  .body {
    @apply z-50 mx-auto w-full overflow-y-auto rounded-lg  bg-white text-gray-900 shadow-xl md:h-max lg:w-1/3;
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

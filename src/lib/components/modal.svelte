<script lang="ts">
  import Icon from 'svelte-fa';
  import { faTimes } from '@fortawesome/free-solid-svg-icons';
  import { createEventDispatcher } from 'svelte';
  import Button from './button.svelte';

  export let open: boolean = false;
  export let hideConfirm: boolean = false;
  export let confirmText: string = 'Confirm';
  export let confirmType: 'destroy' | 'primary';
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
        <Icon icon={faTimes} />
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
      <div class="flex justify-end items-center p-6 space-x-2">
        <Button secondary on:click={() => dispatch('cancelModal', {})}
          >Cancel</Button
        >
        {#if !hideConfirm}
          <Button
            destroy={confirmType === 'destroy'}
            primary={confirmType === 'primary'}
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
    @apply z-50 fixed w-full h-full top-0 left-0 flex items-center justify-center p-8 lg:p-0;
  }

  .overlay {
    @apply fixed w-full h-full bg-gray-900 opacity-50;
  }

  .body {
    @apply bg-white text-gray-900 w-full md:h-max lg:w-1/3  mx-auto rounded-lg shadow-xl z-50 overflow-y-auto;
  }

  .large {
    @apply lg:w-1/2;
  }

  .title {
    @apply bg-white pt-8 pb-0 px-8 text-2xl;
  }

  .content {
    @apply p-8;
  }
</style>

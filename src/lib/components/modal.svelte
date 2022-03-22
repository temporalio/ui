<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from './button.svelte';

  export let open = false;
  export let confirmText = 'Confirm';

  const dispatch = createEventDispatcher();
</script>

{#if open}
  <div class="modal">
    <div class="overlay" />
    <div class="body">
      <div class="title">
        <slot name="title">
          <span>Title</span>
        </slot>
      </div>
      <div class="content">
        <slot name="content">
          <span>Content</span>
        </slot>
      </div>
      <div
        class="flex items-center p-6 space-x-2 rounded-b border-t border-gray-200 dark:border-gray-600"
      >
        <Button secondary on:click={() => dispatch('cancelModal', {})}
          >Cancel</Button
        >
        <Button on:click={() => dispatch('confirmModal', {})}
          >{confirmText}</Button
        >
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
    @apply bg-white w-full lg:h-max lg:w-1/2  mx-auto rounded-lg shadow-xl z-50 overflow-y-auto;
  }

  .title {
    @apply bg-gray-100 py-5 px-8 text-2xl;
  }

  .content {
    @apply p-8;
  }
</style>

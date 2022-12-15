<script lang="ts">
  import Shortcut from '$lib/holocene/keyboard-shortcut/shortcut.svelte';
  export let open = false;
  export let compact: boolean;
</script>

{#if open}
  <div class="modal">
    <div class="overlay" />
    <div
      class="body"
      tabindex="-1"
      role="alertdialog"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <h1 class="title">Keyboard Shortcuts</h1>
      <div class="content flex flex-col gap-4 text-gray-500 dark:text-gray-400">
        <div class="row">
          <Shortcut arrow="left" /> Previous Page
        </div>
        <div class="row">
          <Shortcut arrow="up" tooltipText="Previous Row" /> Previous Row
        </div>
        <div class="row">
          <Shortcut arrow="down" tooltipText="Next Row" /> Next Row
        </div>
        <div class="row">
          <Shortcut arrow="right" tooltipText="Next Page" /> Next Page
        </div>
        {#if !compact}
          <div class="row">
            <div class="flex gap-2 items-center">
              <Shortcut>Shift</Shortcut>
              +
              <Shortcut arrow="up" />
            </div>
            Ascending Sort
          </div>
          <div class="row">
            <div class="flex gap-2 items-center">
              <Shortcut>Shift</Shortcut>
              +
              <Shortcut arrow="down" />
            </div>
            Descending Sort
          </div>
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
    @apply z-50 mx-auto w-full max-w-lg overflow-y-auto rounded-lg bg-gray-500 text-gray-900 shadow-xl md:h-max;
  }

  .large {
    @apply lg:w-1/2;
  }

  .title {
    @apply bg-white px-8 py-4 text-2xl;
  }

  .content {
    @apply whitespace-normal p-8 text-white;
  }

  .row {
    @apply flex items-center gap-4 border-b border-gray-500 py-2;
  }
</style>

<script lang="ts">
  import { page } from '$app/stores';

  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';

  import { searchAttributeOptions } from '$lib/stores/search-attributes';
  import Badge from '$lib/holocene/badge.svelte';

  const { copy, copied } = copyToClipboard(500);
</script>

<div class="flex w-full gap-2 overflow-auto h-12">
  {#each searchAttributeOptions() as option}
    <button on:click={(e) => copy(e, option.value)} class="badge">
      {option.value}
    </button>
  {/each}
</div>

<style lang="postcss">
  .badge {
    @apply flex w-fit h-8 flex-row items-center justify-center rounded-sm p-1 text-sm font-medium transition-colors border-gray-700 bg-white text-gray-700;
  }

  .badge:hover {
    @apply ease-in duration-300 -translate-y-1 bg-gradient-to-br from-blue-100 to-purple-100;
    box-shadow: 3px 3px #18181b, 3px 3px 0px 3px #18181b;
  }
</style>

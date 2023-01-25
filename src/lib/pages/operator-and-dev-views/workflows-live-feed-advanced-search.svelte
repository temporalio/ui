<script lang="ts">
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';

  import { searchAttributeOptions } from '$lib/stores/search-attributes';

  const { copy, copied } = copyToClipboard(500);

  export let onClick: (searchAttribute: string) => void;

  const onSearchAttributeClick = (e: MouseEvent, searchAttribute: string) => {
    copy(e, searchAttribute);
    onClick(searchAttribute);
  };
</script>

<div class="mt-4 mb-2">
  <div class="mt-2 flex gap-4">
    <h3 class="text-md">Search Attributes</h3>
  </div>
  <div class="flex h-12 w-full gap-2 overflow-auto py-1">
    {#each searchAttributeOptions() as option}
      <button
        on:click={(e) => onSearchAttributeClick(e, option.value)}
        class="badge"
      >
        {option.value}
      </button>
    {/each}
  </div>
</div>

<style lang="postcss">
  .badge {
    @apply flex h-8 w-fit flex-row items-center justify-center rounded-sm border-gray-700 bg-white p-1 text-sm font-medium text-gray-700 transition-colors;
  }

  .badge:hover {
    @apply -translate-y-1 bg-gradient-to-br from-blue-100 to-purple-100 duration-300 ease-in;

    box-shadow: 2px 2px #18181b, 2px 2px 0 2px #18181b;
  }
</style>

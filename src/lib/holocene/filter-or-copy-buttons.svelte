<script lang="ts">
  import Icon from '$holocene/icon/icon.svelte';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import { noop } from 'svelte/internal';

  export let show = false;
  export let filterable = true;
  export let copyable = true;
  export let content: string;
  export let onFilter: () => void = noop;
  export let filtered = false;

  const { copy, copied } = copyToClipboard(700);
</script>

{#if show}
  <div class="copy-or-filter" on:click|preventDefault|stopPropagation={noop}>
    {#if filterable}
      <button on:click|preventDefault|stopPropagation={onFilter}>
        {#key filtered}
          <Icon
            name="filter"
            class="h-4 w-4 rounded-sm {filtered
              ? 'bg-gray-900 text-white'
              : ''}"
          />
        {/key}
      </button>
    {/if}
    {#if copyable}
      <button on:click|preventDefault|stopPropagation={(e) => copy(e, content)}>
        <Icon name={$copied ? 'checkmark' : 'copy'} stroke="#000" />
      </button>
    {/if}
  </div>
{/if}

<style lang="postcss">
  .copy-or-filter {
    @apply absolute right-0 top-0 bottom-0 inline-flex gap-2 rounded-full bg-gray-50 px-2;
  }
</style>

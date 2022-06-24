<script lang="ts">
  import Icon from '$lib/holocene/icon/index.svelte';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import { noop } from 'svelte/internal';

  export let show = false;
  export let filterable = true;
  export let copyable = true;
  export let content: string;
  export let onFilter: () => void = noop;
  export let filtered = false;

  const { copy, copied } = copyToClipboard(content, 700);
</script>

{#if show}
  <div class="copy-or-filter" on:click|preventDefault|stopPropagation={noop}>
    {#if filterable}
      <button on:click|preventDefault|stopPropagation={onFilter}>
        {#key filtered}
          <Icon
            name="filter"
            stroke="#000"
            fill={filtered ? '#000' : ''}
            class="h-4 w-4"
          />
        {/key}
      </button>
    {/if}
    {#if copyable}
      <button on:click|preventDefault|stopPropagation={copy}>
        <Icon
          name={$copied ? 'checkMark' : 'copy'}
          stroke="#000"
          class="h-4 w-4"
        />
      </button>
    {/if}
  </div>
{/if}

<style lang="postcss">
  .copy-or-filter {
    @apply absolute right-0 top-0 bottom-0 z-50 inline-flex gap-2 rounded-full bg-gray-50 px-2;
  }
</style>

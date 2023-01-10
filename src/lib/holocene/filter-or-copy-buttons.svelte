<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import { noop } from 'svelte/internal';

  export let show = false;
  export let filterable = true;
  export let copyable = true;
  export let content: string;
  export let onFilter: () => void = noop;
  export let filtered = false;

  let className = '';
  export { className as class };

  const { copy, copied } = copyToClipboard(700);
</script>

{#if show}
  <div
    class="copy-or-filter {className}"
    on:click|preventDefault|stopPropagation={noop}
  >
    {#if filterable}
      <button on:click|preventDefault|stopPropagation={onFilter} class:filtered>
        {#key filtered}
          <Icon name="filter" class="h-5 w-5 " />
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
    @apply absolute right-0 top-0 bottom-0 inline-flex gap-2 px-2;
  }

  .copy-or-filter button {
    @apply relative top-[50%] h-fit translate-y-[-50%] rounded-full p-0.5 hover:bg-white hover:text-primary;
  }

  .filtered {
    @apply bg-gray-900 text-white;
  }
</style>

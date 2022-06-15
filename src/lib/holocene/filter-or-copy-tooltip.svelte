<script lang="ts">
  import Icon from '$lib/holocene/icon/index.svelte';
  import { noop } from 'svelte/internal';

  export let content: string;
  export let top = false;
  export let right = false;
  export let bottom = false;
  export let left = false;
  export let hide: boolean | null = false;
  export let onFilter: () => void;
  export let filtered: boolean;

  let copied = false;

  const copy = () => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        copied = !copied;
        setTimeout(() => (copied = false), 500);
      })
      .catch((error) => console.error(error));
  };
</script>

{#if hide}
  <slot />
{:else}
  <div
    class="wrapper relative inline-block"
    on:click|preventDefault|stopPropagation={noop}
  >
    <slot />
    <div class="tooltip" class:left class:right class:bottom class:top>
      <div class="inline-block rounded-lg bg-gray-800 px-2 py-2 text-gray-100">
        <button on:click|preventDefault|stopPropagation={onFilter} class="mr-1">
          {#key filtered}
            <Icon
              name="filter"
              stroke="#fff"
              fill={filtered ? '#fff' : ''}
              class="inline h-4"
            />
          {/key}
          Filter
        </button>
        <span>|</span>
        <button on:click|preventDefault|stopPropagation={copy}>
          <Icon
            name={copied ? 'checkMark' : 'copy'}
            stroke="#fff"
            class="inline h-4"
          />
          Copy
        </button>
      </div>
    </div>
  </div>
{/if}

<style lang="postcss">
  .tooltip {
    @apply invisible absolute left-0 top-0 z-50 inline-block translate-x-12 whitespace-nowrap text-xs opacity-0 shadow-md transition-all;
  }

  .tooltip.top {
    @apply left-1/2 -mt-4 -translate-x-1/2 -translate-y-full;
  }
  .tooltip.bottom {
    @apply left-1/2 bottom-0 -mb-1 -translate-x-1/2 translate-y-full;
  }
  .tooltip.left {
    @apply left-0 -ml-4 -translate-x-full;
  }
  .tooltip.right {
    @apply right-0 -mr-4 translate-x-full;
  }

  .wrapper:hover .tooltip {
    @apply visible opacity-90;
  }
</style>

<script lang="ts">
  import Copyable from '$lib/components/copyable.svelte';
  import Icon from '$lib/holocene/icon/index.svelte';
  import type { IconName } from '$lib/holocene/icon/paths';

  export let text: string = '';
  export let icon: IconName | undefined = undefined;
  export let top = false;
  export let topRight = false;
  export let right = false;
  export let bottom = false;
  export let bottomLeft = false;
  export let bottomRight = false;
  export let left = false;
  export let copyable = false;
  export let hide: boolean | null = false;
</script>

{#if hide}
  <slot />
{:else}
  <div class="wrapper relative inline-block">
    <slot />
    <div
      class="tooltip"
      class:left
      class:right
      class:bottom
      class:bottomLeft
      class:bottomRight
      class:top
      class:topRight
    >
      <div class="inline-block rounded-lg bg-gray-800 px-2 py-2">
        {#if copyable}
          <Copyable clickAllToCopy content={text} color="white">
            <span class="text-gray-100"
              >{#if icon}<Icon
                  name={icon}
                  class="inline h-4"
                  stroke="#fff"
                />{/if}{text}</span
            >
          </Copyable>
        {:else}
          <span class="flex gap-2 text-gray-100"
            >{#if icon}<Icon
                name={icon}
                class="inline h-4"
                stroke="#fff"
              />{/if}{text}</span
          >
        {/if}
      </div>
    </div>
  </div>
{/if}

<style lang="postcss">
  .tooltip {
    @apply invisible absolute left-0 top-0 z-50 inline-block translate-x-12 whitespace-nowrap text-xs opacity-0 transition-all;
  }

  .tooltip.top {
    @apply left-1/2 -mt-1 -translate-x-1/2 -translate-y-full;
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

  .tooltip.topRight {
    @apply right-1/2 -mt-4 mr-4 -translate-x-1/2 -translate-y-full;
  }
  .tooltip.bottomLeft {
    @apply left-auto right-0 bottom-0 -mb-1 translate-x-0 translate-y-full;
  }
  .tooltip.bottomRight {
    @apply left-0 right-auto bottom-0 -mb-1 translate-x-0 translate-y-full;
  }

  .wrapper:hover .tooltip {
    @apply visible opacity-90;
  }
</style>

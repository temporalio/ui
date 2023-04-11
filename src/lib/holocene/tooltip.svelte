<script lang="ts">
  import Copyable from '$lib/components/copyable.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { IconName } from '$lib/holocene/icon/paths';

  export let text = '';
  export let icon: IconName = null;
  /** bottom center of the tooltip aligned to the top center of the wrapper */
  export let top = false;
  /** bottom right of the tooltip aligned to the top right of the wrapper */
  export let topRight = false;
  /** left center of the tooltip aligned to the right center of the wrapper */
  export let right = false;
  /** top center of the tooltip aligned to the bottom center of the wrapper */
  export let bottom = false;
  /** top left of the tooltip aligned to the bottom left of the wrapper */
  export let bottomLeft = false;
  /** top right of the tooltip aligned to the bottom right of the wrapper */
  export let bottomRight = false;
  /** right center of the tooltip aligned to the left center of the wrapper */
  export let left = false;
  /** bottom left of the tooltip aligned to the top left of the wrapper   */
  export let topLeft = false;
  export let copyable = false;
  export let hide: boolean | null = false;
  export let width: number | null = null;
</script>

{#if hide}
  <slot />
{:else}
  <div class="wrapper relative inline-block {$$props.class}">
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
      class:topLeft
      style={width ? `white-space: pre-wrap; width: ${width}px;` : null}
    >
      <div class="inline-block rounded-lg bg-gray-800 px-2 py-2">
        {#if copyable}
          <Copyable clickAllToCopy content={text} color="white">
            <span class="text-gray-100"
              >{#if icon}<Icon
                  name={icon}
                  class="inline h-4 text-white"
                />{/if}{text}</span
            >
          </Copyable>
        {:else}
          <span class="flex gap-2 text-gray-100"
            >{#if icon}<Icon
                name={icon}
                class="inline h-4 text-white"
              />{/if}{text}</span
          >
        {/if}
      </div>
    </div>
  </div>
{/if}

<style lang="postcss">
  .tooltip {
    @apply absolute left-0 top-0 z-50 hidden translate-x-12 whitespace-nowrap text-xs opacity-0 transition-all;
  }

  .tooltip.top {
    @apply left-1/2 -mt-2 -translate-x-1/2 -translate-y-full;
  }

  .tooltip.bottom {
    @apply left-1/2 bottom-0 -mb-2 -translate-x-1/2 translate-y-full;
  }

  .tooltip.left {
    @apply left-0 top-[50%] -ml-2 -translate-x-full -translate-y-1/2;
  }

  .tooltip.right {
    @apply right-0 top-[50%] -mr-2 translate-x-full -translate-y-1/2;
  }

  .tooltip.topRight {
    @apply left-auto right-0 -mt-2 translate-x-0 -translate-y-full;
  }

  .tooltip.topLeft {
    @apply left-0 right-auto -mt-2 translate-x-0 -translate-y-full;
  }

  .tooltip.bottomLeft {
    @apply left-0 right-auto bottom-0 -mb-2 translate-x-0 translate-y-full;
  }

  .tooltip.bottomRight {
    @apply left-auto right-0 bottom-0 -mb-2 translate-x-0 translate-y-full;
  }

  .wrapper:hover .tooltip {
    @apply inline-block opacity-90;
  }
</style>

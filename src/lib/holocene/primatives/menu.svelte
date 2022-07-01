<script lang="ts" context="module">
  export const triggerMenu = (node: HTMLElement): { destroy: () => void } => {
    type ExtendedPointerEvent<T> = PointerEvent & {
      currentTarget: EventTarget & T;
      path?: NodeList;
    };

    const handleTriggerClick = (event: PointerEvent) => {
      node.dispatchEvent(new CustomEvent('trigger-menu'));
      event.stopPropagation();
    };

    const handleDocumentClick = <T extends EventTarget = HTMLElement>(
      event: ExtendedPointerEvent<T>,
    ) => {
      let eventTarget: EventTarget = event.path?.length
        ? event.path[0]
        : event.target;

      if (!eventTarget && event.relatedTarget)
        eventTarget = event.relatedTarget;

      if (
        node &&
        !node.contains(eventTarget as Node) &&
        !event.defaultPrevented
      ) {
        node.dispatchEvent(new CustomEvent('close-menu'));
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event?.key === 'Escape') {
        node.dispatchEvent(new CustomEvent('close-menu'));
      }
    };

    node.addEventListener('click', handleTriggerClick, false);
    document.addEventListener('click', handleDocumentClick, true);
    document.addEventListener('keyup', handleKeyUp, false);

    return {
      destroy() {
        node.removeEventListener('click', handleTriggerClick, false);
        document.removeEventListener('click', handleDocumentClick, true);
        document.removeEventListener('keyup', handleKeyUp, false);
      },
    };
  };
</script>

<script lang="ts">
  import { fly } from 'svelte/transition';

  export let show = false;
  export let dark = false;
  export let left = true;
  export let right = false;

  let width: number;
</script>

{#if show}
  <div
    in:fly={{ duration: 100 }}
    out:fly={{ duration: 100 }}
    class="absolute z-50 mt-1 w-full overflow-y-scroll rounded-lg border border-gray-900 bg-white text-gray-900 shadow {$$props.class}"
    class:dark
    class:left
    class:right
    {width}
  >
    <slot />
  </div>
{/if}

<style lang="postcss">
  .left {
    @apply left-0 origin-top-left;
  }

  .right {
    @apply right-0 origin-top-right;
  }

  .dark {
    @apply bg-gray-900 text-white;
  }
</style>

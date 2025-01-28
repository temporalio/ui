<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';

  type BaseProps = {
    text?: string;
    icon?: IconName;
    hide?: boolean;
    width?: number;
    class?: string;
    show?: boolean;
    children?: Snippet;
    content?: Snippet;
  };

  type BasePositionProps = {
    /** bottom center of the tooltip aligned to the top center of the wrapper */
    top?: never;
    /** bottom right of the tooltip aligned to the top right of the wrapper */
    topRight?: never;
    /** left center of the tooltip aligned to the right center of the wrapper */
    right?: never;
    /** top center of the tooltip aligned to the bottom center of the wrapper */
    bottom?: never;
    /** top left of the tooltip aligned to the bottom left of the wrapper */
    bottomLeft?: never;
    /** top right of the tooltip aligned to the bottom right of the wrapper */
    bottomRight?: never;
    /** right center of the tooltip aligned to the left center of the wrapper */
    left?: never;
    /** bottom left of the tooltip aligned to the top left of the wrapper   */
    topLeft?: never;
  };

  type OnlyTop = Omit<BasePositionProps, 'top'> & { top: true };
  type OnlyTopRight = Omit<BasePositionProps, 'topRight'> & { topRight: true };
  type OnlyRight = Omit<BasePositionProps, 'right'> & { right: true };
  type OnlyBottomRight = Omit<BasePositionProps, 'bottomRight'> & {
    bottomRight: true;
  };
  type OnlyBottom = Omit<BasePositionProps, 'bottom'> & { bottom: true };
  type OnlyBottomLeft = Omit<BasePositionProps, 'bottomLeft'> & {
    bottomLeft: true;
  };
  type OnlyLeft = Omit<BasePositionProps, 'left'> & { left: true };
  type OnlyTopLeft = Omit<BasePositionProps, 'topLeft'> & { topLeft: true };

  type AllUniquePositionProps =
    | OnlyTop
    | OnlyTopRight
    | OnlyRight
    | OnlyBottomRight
    | OnlyBottom
    | OnlyBottomLeft
    | OnlyLeft
    | OnlyTopLeft;

  type Props = BaseProps & AllUniquePositionProps;

  let {
    class: className = '',
    text = '',
    icon = null,
    top,
    topRight,
    right,
    bottom,
    bottomLeft,
    bottomRight,
    left,
    topLeft,
    hide,
    width = null,
    show,
    children,
    content,
  }: Props = $props();
</script>

{#if hide}
  {@render children?.()}
{:else}
  <div class={merge('wrapper group relative inline-block', className)}>
    {@render children?.()}
    <div
      class={merge(
        'tooltip absolute left-0 top-0 z-50 hidden translate-x-12 whitespace-nowrap text-xs opacity-0 transition-all group-hover:inline-block group-hover:opacity-90',
        show && 'inline-block opacity-90',
      )}
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
      <div class="inline-block rounded-md bg-slate-800 px-2 py-2">
        <div class="flex gap-2 text-slate-100">
          {#if content}
            {@render content()}
          {:else}
            {#if icon}<Icon name={icon} class="inline h-4 text-white" />{/if}
            <span>{text}</span>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style lang="postcss">
  .tooltip.top {
    @apply left-1/2 -mt-2 -translate-x-1/2 -translate-y-full;
  }

  .tooltip.bottom {
    @apply bottom-0 left-1/2 -mb-2 -translate-x-1/2 translate-y-full;
  }

  .tooltip.left {
    @apply left-0 top-[50%] -ml-2 -translate-x-full -translate-y-1/2;
  }

  .tooltip.right {
    @apply right-0 top-[50%] -mr-2 -translate-y-1/2 translate-x-full;
  }

  .tooltip.topRight {
    @apply left-auto right-0 -mt-2 -translate-y-full translate-x-0;
  }

  .tooltip.topLeft {
    @apply left-0 right-auto -mt-2 -translate-y-full translate-x-0;
  }

  .tooltip.bottomLeft {
    @apply bottom-0 left-0 right-auto -mb-2 translate-x-0 translate-y-full;
  }

  .tooltip.bottomRight {
    @apply bottom-0 left-auto right-0 -mb-2 translate-x-0 translate-y-full;
  }
</style>

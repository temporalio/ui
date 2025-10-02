<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { Only } from '$lib/types/global';

  type BaseProps = {
    text?: string;
    icon?: IconName;
    hide?: boolean;
    width?: number;
    class?: string;
    show?: boolean;
    'aria-hidden'?: boolean;
  };

  type BasePositionProps = {
    top?: boolean;
    topRight?: boolean;
    right?: boolean;
    bottomRight?: boolean;
    bottom?: boolean;
    bottomLeft?: boolean;
    left?: boolean;
    topLeft?: boolean;
  };

  type OnlyTop = Only<BasePositionProps, 'top'>;
  type OnlyTopRight = Only<BasePositionProps, 'topRight'>;
  type OnlyRight = Only<BasePositionProps, 'right'>;
  type OnlyBottomRight = Only<BasePositionProps, 'bottomRight'>;
  type OnlyBottom = Only<BasePositionProps, 'bottom'>;
  type OnlyBottomLeft = Only<BasePositionProps, 'bottomLeft'>;
  type OnlyLeft = Only<BasePositionProps, 'left'>;
  type OnlyTopLeft = Only<BasePositionProps, 'topLeft'>;

  type AllUniquePositionProps =
    | OnlyTop
    | OnlyTopRight
    | OnlyRight
    | OnlyBottomRight
    | OnlyBottom
    | OnlyBottomLeft
    | OnlyLeft
    | OnlyTopLeft;

  type $$Props = BaseProps & AllUniquePositionProps;

  let className = '';
  export { className as class };
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
  export let hide: boolean | null = false;
  export let width: number | null = null;
  export let show = false;
  let ariaHidden = $$restProps['aria-hidden'] ?? false;
</script>

{#if hide}
  <slot />
{:else}
  <div class={merge('wrapper group relative inline-block', className)}>
    <slot />
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
      aria-hidden={ariaHidden}
    >
      <div class="inline-block rounded-md bg-slate-800 px-2 py-2">
        <div class="flex gap-2 text-slate-100">
          <slot name="content">
            {#if icon}<Icon name={icon} class="inline h-4 text-white" />{/if}
            <span>{text}</span>
          </slot>
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

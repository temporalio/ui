<script>import Copyable from '../components/copyable.svelte';
import Icon from '$holocene/icon/icon.svelte';
export let text = '';
export let icon = null;
export let top = false;
export let topRight = false;
export let right = false;
export let bottom = false;
export let bottomLeft = false;
export let bottomRight = false;
export let left = false;
export let copyable = false;
export let hide = false;
export let width = null;
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

<style>
  .tooltip {

    visibility: hidden;

    position: absolute;

    left: 0px;

    top: 0px;

    z-index: 50;

    display: inline-block;

    --tw-translate-x: 3rem;

    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));

    white-space: nowrap;

    font-size: 0.75rem;

    line-height: 1rem;

    opacity: 0;

    transition-property: all;

    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

    transition-duration: 150ms
}

  .tooltip.top {

    left: 50%;

    margin-top: -0.25rem;

    --tw-translate-x: -50%;

    --tw-translate-y: -100%;

    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))
}
  .tooltip.bottom {

    left: 50%;

    bottom: 0px;

    margin-bottom: -0.25rem;

    --tw-translate-x: -50%;

    --tw-translate-y: 100%;

    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))
}
  .tooltip.left {

    left: 0px;

    margin-left: -1rem;

    --tw-translate-x: -100%;

    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))
}
  .tooltip.right {

    right: 0px;

    margin-right: -1rem;

    --tw-translate-x: 100%;

    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))
}

  .tooltip.topRight {

    right: 50%;

    margin-top: -1rem;

    margin-right: 1rem;

    --tw-translate-x: -50%;

    --tw-translate-y: -100%;

    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))
}
  .tooltip.bottomLeft {

    left: auto;

    right: 0px;

    bottom: 0px;

    margin-bottom: -0.25rem;

    --tw-translate-x: 0px;

    --tw-translate-y: 100%;

    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))
}
  .tooltip.bottomRight {

    left: 0px;

    right: auto;

    bottom: 0px;

    margin-bottom: -0.25rem;

    --tw-translate-x: 0px;

    --tw-translate-y: 100%;

    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))
}

  .wrapper:hover .tooltip {

    visibility: visible;

    opacity: 0.9
}</style>

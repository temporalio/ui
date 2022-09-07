<script>import { fly } from 'svelte/transition';
export let id;
export let show = false;
export let dark = false;
export let position = 'left';
let width;
</script>

{#if show}
  <ul
    in:fly={{ duration: 100 }}
    role="menu"
    class="absolute z-50 mt-1 w-full list-none overflow-y-scroll rounded border border-gray-300 bg-white text-primary shadow {position} {$$props.class}"
    class:dark
    aria-labelledby={id}
    {width}
    {id}
  >
    <slot />
  </ul>
{/if}

<style>
  .left {

    left: 0px;

    transform-origin: top left
}

  .right {

    right: 0px;

    transform-origin: top right
}

  .dark {

    --tw-bg-opacity: 1;

    background-color: rgb(24 24 27 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(255 255 255 / var(--tw-text-opacity))
}</style>

<script lang="ts">
  import { fly } from 'svelte/transition';

  export let id: string;
  export let show = false;
  export let dark = false;
  export let position: 'left' | 'right' = 'left';
</script>

<ul
  in:fly={{ duration: 100 }}
  role="menu"
  class="absolute z-50 mt-1 w-full list-none rounded border border-gray-300 bg-white text-primary shadow {position} {$$props.class}"
  class:dark
  class:hide={!show}
  aria-labelledby={id}
  {id}
>
  <slot />
</ul>

<style lang="postcss">
  /* We should probably have a nonVisible class here that allows screen readers to see the content.
  Which might be an option on the menu (for things like split buttons) */
  .hide {
    display: none;
  }

  .left {
    @apply left-0 origin-top-left;
  }

  .right {
    @apply right-0 origin-top-right;
  }

  .dark {
    @apply bg-primary text-white;
  }
</style>

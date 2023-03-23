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
  class="absolute z-50 mt-1 w-full list-none rounded border border-gray-900 bg-white text-primary shadow {position} {$$props.class}"
  class:dark
  class:sr-only={!show}
  aria-labelledby={id}
  {id}
>
  <slot />
</ul>

<style lang="postcss">
  :global(.menu-item) {
    &:first-child {
      @apply rounded-t;
    }

    &:last-child {
      @apply rounded-b;
    }
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

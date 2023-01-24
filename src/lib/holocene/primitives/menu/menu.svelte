<script lang="ts">
  import { fly } from 'svelte/transition';

  export let id: string;
  export let show = false;
  export let dark = false;
  export let position: 'left' | 'right' = 'left';
</script>

{#if show}
  <ul
    in:fly={{ duration: 100 }}
    role="menu"
    class="absolute z-50 mt-1 w-full list-none overflow-y-scroll rounded border border-gray-300 bg-white text-primary shadow {position} {$$props.class}"
    class:dark
    aria-labelledby={id}
    {id}
  >
    <slot />
  </ul>
{/if}

<style lang="postcss">
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

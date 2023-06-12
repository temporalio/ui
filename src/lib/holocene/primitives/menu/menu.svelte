<script lang="ts">
  import { getContext } from 'svelte';
  import { fly } from 'svelte/transition';
  import { MENU_CONTEXT, type MenuContext } from './menu-container.svelte';

  export let id: string;
  export let dark = false;
  export let keepOpen = false;
  export let position: 'left' | 'right' = 'left';

  const { keepOpen: keepOpenCtx, open } = getContext<MenuContext>(MENU_CONTEXT);

  $: $keepOpenCtx = keepOpen;
</script>

<ul
  in:fly={{ duration: 100 }}
  role="menu"
  tabindex="0"
  class="absolute z-50 mt-1 w-full list-none rounded border border-gray-900 bg-white text-primary shadow focus:outline-none focus-visible:outline focus-visible:outline-blue-700 focus-visible:-outline-offset-2 {position} {$$props.class}"
  class:dark
  class:sr-only={!$open}
  aria-labelledby={id}
  {id}
>
  <slot />
</ul>

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

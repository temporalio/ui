<script lang="ts">
  import { page } from '$app/stores';
  import { pathMatches } from '$lib/utilities/path-matches';

  export let href: string;

  $: isActive = pathMatches(href, $page.url.pathname);
</script>

<a {href} class:active={isActive} class="relative">
  <slot />
</a>

<style lang="postcss">
  a.active {
    @apply text-blue-200 opacity-100;
  }

  a.active::after {
    @apply absolute inset-x-0 bottom-0 rounded-t bg-blue-200;

    content: "";
    height: 3px;
  }

  a:hover {
    @apply opacity-100;
  }

  a {
    @apply block px-2 py-5 text-base font-medium text-white;
  }
</style>

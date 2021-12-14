<script lang="ts">
  import { page } from '$app/stores';
  import { pathMatches } from '$lib/utilities/path-matches';

  export let href: string;

  $: isActive = pathMatches(href, $page.path);
</script>

<a {href} class:active={isActive} class="relative">
  <slot />
</a>

<style lang="postcss">
  a.active {
    @apply border-b-2 border-blue-200 text-blue-200 opacity-100;
  }
  a:hover {
    @apply opacity-100;
  }
  a {
    @apply block px-2 py-4 text-base font-medium text-white;
  }
</style>

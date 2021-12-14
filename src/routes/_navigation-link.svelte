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
    @apply text-blue-200 opacity-100;
  }

  a.active:after {
    @apply bg-blue-200;
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    border-radius: 20px 20px 0 0;
  }
  a:hover {
    @apply opacity-100;
  }
  a {
    @apply block px-2 py-5 text-base font-medium text-white;
  }
</style>

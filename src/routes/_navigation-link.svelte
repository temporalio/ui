<script lang="ts">
  import { page } from '$app/stores';
  import { pathMatches } from '$lib/utilities/path-matches';
  import Icon from 'svelte-hero-icons';

  export let href: string;
  export let label: string;
  export let icon: Heroicon;

  $: isActive = pathMatches(href, $page.path);
</script>

<a {href} class:active={isActive} class="relative" data-tooltip={label}>
  <Icon src={icon} alt={label} class="mx-auto text-white w-8 h-8" />
</a>

<style lang="postcss">
  a.active {
    @apply bg-purple-900 text-white opacity-100;
  }

  a:hover {
    @apply opacity-100;
  }

  a {
    @apply no-underline opacity-70 rounded-lg text-center text-gray-400 text-xs;
  }
</style>

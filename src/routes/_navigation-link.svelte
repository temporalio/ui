<script lang="ts">
  import { page } from '$app/stores';
  import { pathMatches } from '$lib/utilities/path-matches';
  import HeroIcons from '$lib/components/hero-icons.svelte';
  import Tooltip from '$lib/components/tooltip.svelte';

  export let href: string;
  export let label: string;
  export let icon: string;

  $: isActive = pathMatches(href, $page.path);
</script>

<Tooltip text={label}>
  <a {href} class:active={isActive} class="relative" data-tooltip={label}>
    <HeroIcons {icon} styles="mx-auto text-white w-8 h-8" />
  </a>
</Tooltip>

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

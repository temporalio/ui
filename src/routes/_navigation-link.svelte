<script lang="ts">
  import { page } from '$app/stores';
  import { pathMatches } from '$lib/utilities/path-matches';
  import Icon from 'svelte-hero-icons';

  export let href: string;
  export let label: string;
  export let icon: Heroicon;

  $: isActive = pathMatches(href, $page.path);
</script>

<a {href} class:active={isActive}>
  <Icon src={icon} class="mb-2 mx-auto text-white w-8 h-8" />
  <p>{label}</p>
</a>

<style lang="postcss">
  a.active {
    @apply bg-purple-900 text-white opacity-100;
  }

  a:hover {
    @apply opacity-100;
  }

  a {
    @apply m-4 no-underline opacity-70 p-4 rounded-lg text-center text-gray-400 text-xs w-24;
  }
</style>

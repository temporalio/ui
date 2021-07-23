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
    @apply bg-purple-900;
    @apply text-white;
    @apply opacity-100;
  }

  a:hover {
    @apply opacity-100;
  }

  a {
    @apply m-4;
    @apply no-underline;
    @apply opacity-70;
    @apply p-4;
    @apply rounded-lg;
    @apply text-center;
    @apply text-gray-400;
    @apply text-xs;
    @apply w-24;
  }
</style>

<script>
  import { page } from '$app/stores';
  import { pathMatches } from '$lib/utilities/path-matches';

  $: ({ href, src, alt, ...props } = $$props);
  $: isActive = pathMatches(href, $page.path);
</script>

<a {href} class:active={isActive}
  ><img
    class:hue-rotate-30={isActive}
    class="mb-2 mx-auto text-white fill-current w-8 h-8"
    {src}
    {alt}
    {...props}
  /><slot /></a
>

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
    @apply mb-4;
    @apply no-underline;
    @apply p-4;
    @apply text-center;
    @apply text-gray-400;
    @apply text-xs;
    @apply w-24;
    @apply opacity-70;
  }
</style>

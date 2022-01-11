<script lang="ts">
  import Icon from 'svelte-fa';
  import { getContext } from 'svelte';
  import { page } from '$app/stores';

  import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
  import { appendQueryParameters } from '$lib/utilities/append-query-parameters';

  export let icon: IconDefinition;
  export let group = getContext<boolean>('group');
  export let scale = 1;
  export let href: string;
</script>

<a
  class="border-2 py-2 px-4 hover:text-white hover:bg-gray-600 flex items-center justify-center"
  class:rounded-lg={!group}
  class:active={$page.path.includes(href)}
  class:group
  href={appendQueryParameters(href, $page.query)}
>
  <Icon {icon} {scale} />
</a>

<style lang="postcss">
  .active {
    @apply bg-gray-900 text-white hover:bg-gray-900;
  }

  .group:first-child {
    @apply rounded-tl-lg rounded-bl-lg;
  }

  .group:not(:last-child) {
    @apply border-r-0;
  }

  .group:last-child {
    @apply rounded-tr-lg rounded-br-lg;
  }
</style>

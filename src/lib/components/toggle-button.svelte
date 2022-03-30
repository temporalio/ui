<script lang="ts">
  import Icon from 'svelte-fa';
  import { page } from '$app/stores';

  import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

  import { getAppContext } from '$lib/utilities/get-context';

  export let icon: IconDefinition;
  export let group = getAppContext('group');
  export let scale = 1;
  export let href = '#';
  export let base = href;
  export let active: boolean = false;
</script>

<a
  class="border-2 py-2 px-4 hover:text-white text-sm hover:bg-gray-600 flex items-center justify-center"
  class:rounded-lg={!group}
  class:active={$page.url.pathname.includes(base) || active}
  class:group
  href={href + $page.url.search}
  on:click
>
  {#if icon}
    <div class="flex gap-2 items-center">
      <Icon {icon} {scale} />
      <slot />
    </div>
  {:else}
    <slot />
  {/if}
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

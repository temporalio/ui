<script lang="ts">
  import Icon from '$holocene/icon/icon.svelte';
  import { page } from '$app/stores';

  import type { IconName } from '$lib/holocene/icon/paths';

  import { getAppContext } from '$lib/utilities/get-context';

  export let icon: IconName = null;
  export let group = getAppContext('group');
  export let scale = 1;
  export let href = '#';
  export let base = href;
  export let active: boolean = false;
</script>

<a
  class="flex items-center justify-center border border-gray-900 py-2 px-4 text-sm {$$props.class}"
  class:rounded-lg={!group}
  class:active={$page.url.pathname.includes(base) || active}
  class:group
  href={href + $page.url.search}
  id={$$props.id}
  {...$$props}
  on:click
>
  {#if icon}
    <div class="flex items-center gap-2">
      <Icon stroke="currentColor" name={icon} {scale} />
      <span class="hidden md:block"><slot /></span>
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

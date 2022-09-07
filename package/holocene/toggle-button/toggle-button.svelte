<script>import Icon from '$holocene/icon/icon.svelte';
import { page } from '$app/stores';
import { getAppContext } from '../../utilities/get-context';
export let icon = null;
export let group = getAppContext('group');
export let href = '#';
export let base = href;
export let active = false;
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
      <Icon name={icon} />
      <span class="hidden md:block"><slot /></span>
    </div>
  {:else}
    <slot />
  {/if}
</a>

<style>
  .active {

    --tw-bg-opacity: 1;

    background-color: rgb(24 24 27 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(255 255 255 / var(--tw-text-opacity))
}

.active:hover {

    --tw-bg-opacity: 1;

    background-color: rgb(24 24 27 / var(--tw-bg-opacity))
}

  .group:first-child {

    border-top-left-radius: 0.5rem;

    border-bottom-left-radius: 0.5rem
}

  .group:not(:last-child) {

    border-right-width: 0px
}

  .group:last-child {

    border-top-right-radius: 0.5rem;

    border-bottom-right-radius: 0.5rem
}</style>

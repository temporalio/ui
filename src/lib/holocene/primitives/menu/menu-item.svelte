<script lang="ts">
  import {
    type ComponentProps,
    createEventDispatcher,
    getContext,
  } from 'svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { MENU_CONTEXT, type MenuContext } from './menu-container.svelte';

  export let dark = false;
  export let selected = false;
  export let destructive = false;
  export let active = false;
  export let disabled = false;
  export let href = '';
  export let testId: string = null;
  export let tooltipProps: { text?: string; width?: number } = {};

  const { keepOpen, closeMenu } = getContext<MenuContext>(MENU_CONTEXT);

  const dispatch = createEventDispatcher<{ click: undefined }>();

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      if (!$keepOpen) closeMenu();
      dispatch('click');
    }
  };

  const handleClick = () => {
    if (!$keepOpen) closeMenu();
    dispatch('click');
  };

  $: ({ text, ...restTooltipProps } = tooltipProps);
</script>

<Tooltip left class="w-full" hide={!text} {text} {...restTooltipProps}>
  {#if href}
    <a
      {href}
      role="menuitem"
      class:dark
      class:destructive
      class:selected
      class:active
      class:disabled
      data-testid={testId}
      class="menu-item inline-block {$$props.class}"
    >
      <slot />
    </a>
  {:else}
    <li
      on:click|preventDefault|stopPropagation={handleClick}
      on:keyup={handleKeyUp}
      role="menuitem"
      tabindex="0"
      class:dark
      class:destructive
      class:selected
      class:active
      class:disabled
      data-testid={testId}
      class="menu-item {$$props.class}"
    >
      {#if selected}
        <Icon width={18} height={18} name="checkmark" />
      {/if}
      <slot />
    </li>
  {/if}
</Tooltip>

<style lang="postcss">
  .menu-item {
    @apply w-full flex flex-col cursor-pointer list-none bg-white p-2 my-2 first-of-type:mt-0 last-of-type:mb-0 font-primary text-sm font-medium text-primary hover:bg-gray-50 rounded focus:outline-none focus-visible:outline focus-visible:bg-blue-50 focus-visible:outline-blue-700 focus-visible:-outline-offset-2;
  }

  .dark {
    @apply bg-primary text-white hover:bg-gray-800;

    &.selected,
    &.active {
      @apply bg-gray-800 text-blue-100;
    }
  }

  .active,
  .selected {
    @apply flex flex-row gap-2 items-center text-blue-700;
  }

  .destructive {
    @apply text-red-700 hover:bg-red-50;
  }

  .menu-item.disabled {
    @apply cursor-not-allowed pointer-events-none text-gray-500;
  }
</style>

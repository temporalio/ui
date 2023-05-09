<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { IconName } from '$lib/holocene/icon/paths';
  import { getContext } from 'svelte';
  import { type MenuContext, MENU_CONTEXT } from './menu-container.svelte';
  export let controls: string;
  export let dark = false;
  export let disabled = false;
  export let hasIndicator = false;
  export let id: string = null;
  export let icon: IconName = null;

  const { toggleMenu, open } = getContext<MenuContext>(MENU_CONTEXT);

  const handleClick = () => {
    if (!disabled) {
      toggleMenu();
    }
  };
</script>

<button
  type="button"
  {id}
  aria-haspopup={!disabled}
  aria-controls={controls}
  aria-expanded={$open}
  on:click|preventDefault={handleClick}
  class={$$props.class}
  class:dark
  class:show={$open}
  class:hasIndicator
  {disabled}
  data-testid={$$props.testId}
>
  {#if icon}
    <Icon name={icon} />
  {/if}
  <slot />
  {#if hasIndicator}
    <Icon
      class="pointer-events-none"
      name={$open ? 'chevron-up' : 'chevron-down'}
    />
  {/if}
</button>

<style lang="postcss">
  .hasIndicator {
    @apply flex flex-row items-center justify-between;
  }

  button.dark,
  button.dark > * {
    @apply bg-primary text-white;
  }

  button.disabled {
    @apply bg-gray-50 text-gray-600;
  }
</style>

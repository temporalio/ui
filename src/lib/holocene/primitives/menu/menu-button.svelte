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
  class="text-sm flex flex-row items-center {$$props.class}"
  class:dark
  class:show={$open}
  class:has-indicator={hasIndicator}
  class:has-icon={!!icon}
  {disabled}
  data-testid={$$props.testId}
>
  {#if icon}<Icon name={icon} />{/if}<slot />{#if hasIndicator}
    <Icon
      class="pointer-events-none"
      name={$open ? 'chevron-up' : 'chevron-down'}
    />
  {/if}
</button>

<style lang="postcss">
  .has-icon {
    @apply gap-2;
  }

  .has-indicator {
    @apply justify-between;
  }

  button.dark,
  button.dark > * {
    @apply bg-primary text-white;
  }

  button.disabled {
    @apply bg-gray-50 text-gray-600;
  }
</style>

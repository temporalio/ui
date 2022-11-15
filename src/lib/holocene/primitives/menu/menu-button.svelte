<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { triggerMenu } from './trigger-menu';
  export let show: boolean;
  export let controls: string;
  export let dark = false;
  export let disabled = false;
  export let hasIndicator = false;
  export let keepOpen = false;
  export let id: string = null;

  const close = () => {
    !disabled && (show = false);
  };

  const toggle = () => {
    !disabled && (show = !show);
  };
</script>

<button
  type="button"
  {id}
  aria-haspopup={!disabled}
  aria-controls={controls}
  aria-expanded={show}
  use:triggerMenu={keepOpen}
  on:close-menu={close}
  on:toggle-menu={toggle}
  on:click|preventDefault
  class={$$props.class}
  class:dark
  class:show
  {disabled}
>
  <slot />
  {#if hasIndicator}
    <Icon
      class="pointer-events-none"
      name={show ? 'chevron-up' : 'chevron-down'}
    />
  {/if}
</button>

<style lang="postcss">
  button.dark,
  button.dark > * {
    @apply bg-primary text-white;
  }

  button.disabled {
    @apply bg-gray-50 text-gray-600;
  }
</style>

<script lang="ts">
  import { triggerMenu } from './trigger-menu';
  export let show: boolean;
  export let controls: string;
  export let dark = false;
  export let disabled = false;

  const close = () => {
    !disabled && (show = false);
  };

  const toggle = () => {
    !disabled && (show = !show);
  };
</script>

<button
  type="button"
  aria-haspopup={!disabled}
  aria-controls={controls}
  aria-expanded={show}
  use:triggerMenu
  on:close-menu={close}
  on:toggle-menu={toggle}
  on:click
  class={$$props.class}
  class:dark
  {disabled}
>
  <slot />
</button>

<style lang="postcss">
  button.dark,
  button.dark > * {
    @apply bg-primary text-white;
  }

  button:disabled {
    @apply cursor-not-allowed;
  }
</style>

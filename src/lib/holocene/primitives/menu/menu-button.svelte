<script lang="ts">
  import { triggerMenu } from './trigger-menu';
  export let show: boolean;
  export let controls: string;
  export let dark = false;
  export let disabled = false;
  export let keepOpen = false;

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

<script lang="ts">
  import { triggerMenu } from './trigger-menu';
  export let show: boolean;
  export let controls: string;
  export let dark = false;
  export let disabled = false;
  const close = () => (show = false);
  const open = () => (show = true);
  const toggle = () => (show = !show);
</script>

<button
  aria-haspopup={!disabled}
  aria-controls={controls}
  aria-expanded={show}
  use:triggerMenu
  on:open-menu={open}
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
  .dark,
  .dark > * {
    @apply bg-primary text-white;
  }
</style>

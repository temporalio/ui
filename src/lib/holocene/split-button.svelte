<script lang="ts">
  import Icon from '$holocene/icon/index.svelte';
  import { noop } from 'svelte/internal';
  import Menu, { triggerMenu } from './primatives/menu.svelte';
  export let label: string;
  export let disabled: boolean = false;
  export let left: boolean = false;
  export let right: boolean = false;

  let show: boolean = false;
  const hide = () => (show = false);
  const toggle = () => (show = !show);
</script>

<div
  class="relative inline-block"
  use:triggerMenu
  on:trigger-menu={disabled ? noop : toggle}
  on:close-menu={disabled ? noop : hide}
>
  <div class="split-button" class:disabled>
    <button {disabled} class="segment rounded-l px-4">
      {label}
    </button>
    <div class="segment rounded-r px-2">
      <Icon stroke="currentcolor" name="caretDown" />
    </div>
  </div>
  <Menu
    class="flex min-w-max flex-col gap-y-4 border-gray-300 p-6 font-poppins text-sm"
    {show}
    {left}
    {right}
  >
    <slot />
  </Menu>
</div>

<style lang="postcss">
  .split-button {
    @apply flex grow cursor-pointer flex-row gap-[1px] font-poppins;
  }

  .split-button.disabled {
    @apply cursor-not-allowed opacity-50;
  }

  .segment:disabled {
    @apply cursor-not-allowed;
  }

  .segment {
    @apply inline-block bg-gray-900 py-2 text-sm text-white shadow;
  }
</style>

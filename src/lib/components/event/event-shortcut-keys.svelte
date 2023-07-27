<script lang="ts">
  import Shortcut from '$lib/holocene/keyboard-shortcut/shortcut.svelte';
  import Drawer from '$lib/holocene/drawer.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';

  export let open = false;
  export let onOpen: () => void;
  export let onClose: () => void;
</script>

<div class="shortcut-key-button">
  <Button class="!py-1.5 !px-1" variant="secondary" on:click={onOpen}
    ><span class="flex h-[24px] w-[24px] items-center justify-center text-xl"
      >?</span
    ></Button
  >
</div>
<Drawer
  {open}
  onClick={onClose}
  title={translate('keyboard-shortcuts')}
  closeButtonLabel={translate('close-keyboard-shortcuts')}
>
  <div
    class="grid grid-cols-1 gap-8 text-gray-500 dark:text-gray-400 md:grid-cols-2 xl:grid-cols-4"
  >
    <div class="cell">
      {translate('next-page')}
      <div class="shortcut">
        <Shortcut arrow="right" />|<Shortcut>L</Shortcut>
      </div>
    </div>
    <div class="cell">
      {translate('previous-page')}
      <div class="shortcut">
        <Shortcut arrow="left" />|<Shortcut>H</Shortcut>
      </div>
    </div>
    <div class="cell">
      {translate('next-row')}
      <div class="shortcut">
        <Shortcut arrow="down" />|<Shortcut>J</Shortcut>
      </div>
    </div>
    <div class="cell">
      {translate('previous-row')}
      <div class="shortcut">
        <Shortcut arrow="up" />|<Shortcut>K</Shortcut>
      </div>
    </div>
  </div>
</Drawer>

<style lang="postcss">
  .shortcut-key-button {
    @apply fixed right-16 bottom-5 z-50;
  }

  .cell {
    @apply flex items-center justify-center gap-8 text-white;
  }

  .shortcut {
    @apply flex items-center gap-2;
  }
</style>

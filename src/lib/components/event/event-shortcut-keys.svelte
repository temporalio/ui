<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Drawer from '$lib/holocene/drawer.svelte';
  import Shortcut from '$lib/holocene/keyboard-shortcut/shortcut.svelte';
  import { translate } from '$lib/i18n/translate';

  export let open = false;
  export let onOpen: () => void;
  export let onClose: () => void;
</script>

<div class="shortcut-key-button">
  <Button variant="secondary" on:click={onOpen}>?</Button>
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
        <Shortcut
          arrow="right"
          title={translate('arrow-key-right')}
        />|<Shortcut title="">L</Shortcut>
      </div>
    </div>
    <div class="cell">
      {translate('previous-page')}
      <div class="shortcut">
        <Shortcut arrow="left" title={translate('arrow-key-left')} />|<Shortcut
          title="">H</Shortcut
        >
      </div>
    </div>
    <div class="cell">
      {translate('next-row')}
      <div class="shortcut">
        <Shortcut arrow="down" title={translate('arrow-key-down')} />|<Shortcut
          title="">J</Shortcut
        >
      </div>
    </div>
    <div class="cell">
      {translate('previous-row')}
      <div class="shortcut">
        <Shortcut arrow="up" title={translate('arrow-key-up')} />|<Shortcut
          title="">K</Shortcut
        >
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

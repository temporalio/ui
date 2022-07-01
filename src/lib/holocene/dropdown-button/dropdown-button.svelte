<script lang="ts">
  import Icon from '$holocene/icon/index.svelte';
  import type { IconName } from '$holocene/icon/paths';
  import Menu, { triggerMenu } from '../primatives/menu.svelte';

  export let label: string;
  export let icon: IconName = null;
  export let readonly = false;

  let show = false;
  const toggle = () => (show = !show);
  const hide = () => (show = false);
</script>

<div class="relative inline-block {$$props.class}">
  <div
    class="dropdown-button"
    use:triggerMenu
    on:close-menu={hide}
    on:trigger-menu={toggle}
    class:readonly
  >
    {#if icon}
      <div class="ml-4 flex items-center">
        <Icon
          name={icon}
          strokeWidth={1}
          width={12}
          height={12}
          stroke="currentcolor"
        />
      </div>
    {/if}
    <span class="ml-2 mr-8">{label}</span>
    {#if !readonly}
      <div class="mr-2">
        <Icon scale={0.8} name={show ? 'caretUp' : 'caretDown'} />
      </div>
    {/if}
  </div>
  <Menu class="border-gray-300" bind:show>
    <div class="flex flex-col gap-4 p-4">
      <slot />
    </div>
  </Menu>
</div>

<style lang="postcss">
  .dropdown-button {
    @apply flex cursor-pointer flex-row items-center justify-between rounded-lg border border-gray-300 bg-white py-4;
  }

  .dropdown-button.readonly {
    @apply cursor-default;
  }
</style>

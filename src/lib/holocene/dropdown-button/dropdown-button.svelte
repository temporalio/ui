<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { IconName } from '$lib/holocene/icon/paths';
  import MenuContainer from '$lib/holocene/primitives/menu/menu-container.svelte';
  import MenuButton from '$lib/holocene/primitives/menu/menu-button.svelte';
  import Menu from '$lib/holocene/primitives/menu/menu.svelte';

  export let label: string;
  export let id: string;
  export let icon: IconName = null;
  export let readonly = false;

  let show = false;
</script>

<MenuContainer class={$$props.class}>
  <MenuButton
    bind:show
    class="flex flex-row items-center rounded-lg border border-gray-900 bg-white p-2"
    controls={id}
    disabled={readonly}
    hasIndicator={!readonly}
  >
    {#if icon}
      <div class="ml-2 flex items-center">
        <Icon name={icon} />
      </div>
    {/if}
    <span class="ml-2 mr-8">{label}</span>
  </MenuButton>
  <Menu class="min-w-max" {id} {show}>
    <slot />
  </Menu>
</MenuContainer>

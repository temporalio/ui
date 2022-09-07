<script>import Icon from '$holocene/icon/icon.svelte';
import MenuContainer from '$holocene/primitives/menu/menu-container.svelte';
import MenuButton from '$holocene/primitives/menu/menu-button.svelte';
import Menu from '$holocene/primitives/menu/menu.svelte';
export let label;
export let id;
export let icon = null;
export let readonly = false;
let show = false;
</script>

<MenuContainer class={$$props.class}>
  <MenuButton
    bind:show
    class="flex flex-row items-center rounded-lg border border-gray-300 bg-white py-2"
    controls={id}
    disabled={readonly}
  >
    {#if icon}
      <div class="ml-4 flex items-center">
        <Icon name={icon} />
      </div>
    {/if}
    <span class="ml-2 mr-8">{label}</span>
    {#if !readonly}
      <div class="mr-2">
        <Icon name={show ? 'chevron-up' : 'chevron-down'} />
      </div>
    {/if}
  </MenuButton>
  <Menu class="min-w-max" {id} {show}>
    <slot />
  </Menu>
</MenuContainer>

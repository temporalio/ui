<script>import MenuButton from './primitives/menu/menu-button.svelte';
import MenuContainer from './primitives/menu/menu-container.svelte';
import Menu from './primitives/menu/menu.svelte';
let show = false;
export let id;
export let position = 'left';
</script>

<MenuContainer>
  <MenuButton controls={id} bind:show>
    <slot name="trigger" />
  </MenuButton>
  <Menu {position} class="min-w-fit" {show} {id}>
    <slot name="items" />
  </Menu>
</MenuContainer>

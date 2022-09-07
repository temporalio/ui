<script>import Icon from '$holocene/icon/icon.svelte';
import MenuContainer from '$holocene/primitives/menu/menu-container.svelte';
import MenuButton from '$holocene/primitives/menu/menu-button.svelte';
import Menu from '$holocene/primitives/menu/menu.svelte';
import Button from './button.svelte';
export let label;
export let id;
export let disabled = false;
export let position = 'left';
export let href = '';
let show = false;
</script>

<MenuContainer class={$$props.class}>
  <div class="split-button" class:disabled>
    <Button {href} variant="primary" {disabled} class="segment left" on:click>
      {label}
    </Button>
    <MenuButton dark class="segment right" bind:show controls={id} {disabled}>
      <Icon name="chevron-down" />
    </MenuButton>
  </div>
  <Menu class="min-w-max" {id} {show} {position}>
    <slot />
  </Menu>
</MenuContainer>

<style>
  .split-button {

    display: flex;

    flex-grow: 1;

    cursor: pointer;

    flex-direction: row;

    gap: 1px;

    font-family: Poppins, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"
}

    .split-button :global(.segment) {

    position: relative;

    display: flex;

    width: -webkit-fit-content;

    width: -moz-fit-content;

    width: fit-content;

    align-items: center;

    justify-content: center;

    padding-top: 0.5rem;

    padding-bottom: 0.5rem;

    font-family: Poppins, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";

    font-size: 0.875rem;

    line-height: 1.25rem
}

    .split-button :global(.segment.left) {

    border-radius: 0px;

    border-top-left-radius: 0.25rem;

    border-bottom-left-radius: 0.25rem;

    padding-left: 1rem;

    padding-right: 1rem
}

    .split-button :global(.segment.right) {

    border-top-right-radius: 0.25rem;

    border-bottom-right-radius: 0.25rem;

    padding-left: 0.5rem;

    padding-right: 0.5rem
}

    .split-button :global(.segment.right:disabled) {

    cursor: not-allowed;

    opacity: 0.5
}

    .split-button :global(.segment.right:enabled):hover {

    --tw-bg-opacity: 1;

    background-color: rgb(29 78 216 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(244 244 245 / var(--tw-text-opacity))
}</style>

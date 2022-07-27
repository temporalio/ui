<script lang="ts">
  import Icon from '$holocene/icon/index.svelte';
  import type { IconName } from '$holocene/icon/paths';
  import MenuContainer from '$holocene/primitives/menu/menu-container.svelte';
  import MenuButton from '$holocene/primitives/menu/menu-button.svelte';
  import Menu from '$holocene/primitives/menu/menu.svelte';

  export let label: string;
  export let id: string;
  export let icon: IconName = '';
  export let readonly = false;

  let show = false;
</script>

<MenuContainer class={$$props.class}>
  <MenuButton
    bind:show
    class="flex flex-row items-center rounded-lg border border-gray-300 bg-white py-4"
    controls={id}
    disabled={readonly}
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
  </MenuButton>
  <Menu class="min-w-max" {id} {show}>
    <slot />
  </Menu>
</MenuContainer>

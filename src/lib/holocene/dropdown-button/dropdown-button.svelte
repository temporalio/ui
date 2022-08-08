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
  export let disabled = false;
  export let border: 'light' | 'dark' = 'light';

  let show = false;
</script>

<MenuContainer class={$$props.class}>
  <MenuButton
    bind:show
    class="flex flex-row items-center rounded-lg border {border === 'dark'
      ? 'border-gray-600'
      : 'border-gray-300'} bg-white py-2"
    controls={id}
    disabled={disabled || readonly}
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
    <span class="ml-2 mr-8" class:disabled>{label}</span>
    {#if !readonly}
      <div class="mr-2" class:disabled>
        {#if disabled}
          <Icon scale={0.8} name="lock" stroke="currentcolor" />
        {:else}
          <Icon scale={0.8} name={show ? 'caretUp' : 'caretDown'} />
        {/if}
      </div>
    {/if}
  </MenuButton>
  <Menu class="min-w-max" {id} {show}>
    <slot />
  </Menu>
</MenuContainer>

<style lang="postcss">
  .disabled {
    @apply text-gray-600;
  }
</style>

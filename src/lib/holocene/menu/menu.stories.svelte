<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Meta, Story } from '@storybook/addon-svelte-csf';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuItem,
  } from '$lib/holocene/menu';
</script>

<Meta
  title="Menu"
  argTypes={{
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
    },
  }}
/>

<Story name="menu" args={{ variant: 'primary' }} let:args>
  <MenuContainer>
    <MenuButton hasIndicator variant={args.variant} controls="menu-1">
      <Icon slot="leading" name="temporal-logo" />
      Menu
    </MenuButton>
    <Menu id="menu-1">
      <MenuItem href="https://temporal.io">Link</MenuItem>
      <MenuItem disabled href="https://temporal.io">Disabled Link</MenuItem>
      <MenuItem on:click={action('click')} selected>Selected</MenuItem>
      <MenuItem on:click={action('click')}>Standard</MenuItem>
      <MenuItem on:click={action('click')} destructive>Destructive</MenuItem>
    </Menu>
  </MenuContainer>
</Story>

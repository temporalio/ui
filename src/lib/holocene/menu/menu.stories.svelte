<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuItem,
  } from '$lib/holocene/menu';

  export const meta = {
    title: 'Menu',
    component: MenuButton,
    subcomponents: { MenuButton, MenuContainer, MenuItem },
    args: {
      variant: 'primary',
      keepOpen: false,
      position: 'left',
    },
    argTypes: {
      variant: {
        name: 'Variant',
        control: 'select',
        options: ['primary', 'secondary', 'ghost'],
      },
      keepOpen: {
        name: 'Keep Open',
        control: 'boolean',
      },
      position: {
        name: 'Position',
        control: 'inline-radio',
        options: ['left', 'right'],
      },
      menuElement: {
        name: 'Menu Element',
        table: {
          disable: true,
        },
      },
    },
  } satisfies Meta<MenuButton | Menu>;
</script>

<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Story, Template } from '@storybook/addon-svelte-csf';

  import { shouldNotBeTransparent } from '../test-utilities';
</script>

<Template let:args let:context>
  <MenuContainer>
    <MenuButton hasIndicator variant={args.variant} controls={context.id}>
      <Icon slot="leading" name="temporal-logo" />
      Menu
    </MenuButton>
    <Menu id={context.id}>
      <MenuItem href="https://temporal.io" on:click={action('click')}>
        Link
      </MenuItem>
      <MenuItem disabled href="https://temporal.io">Disabled Link</MenuItem>
      <MenuItem on:click={action('click')} selected>Selected</MenuItem>
      <MenuItem on:click={action('click')}>Standard</MenuItem>
      <MenuItem on:click={action('click')} destructive>Destructive</MenuItem>
    </Menu>
  </MenuContainer>
</Template>

<Story name="Primary" args={{ variant: 'primary' }} />

<Story
  name="Secondary"
  args={{ variant: 'secondary' }}
  play={shouldNotBeTransparent((canvas) => canvas.getByRole('button'))}
/>

<Story name="Ghost" args={{ variant: 'ghost' }} />

<Story name="Keep Open" args={{ keepOpen: true }} />

<Story name="Right" args={{ position: 'right' }} />

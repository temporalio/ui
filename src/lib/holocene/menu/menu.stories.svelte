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
        options: ['left', 'right', 'top-left', 'top-right'],
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
  <div class="flex items-center justify-center">
    <MenuContainer>
      <MenuButton hasIndicator variant={args.variant} controls={context.id}>
        <Icon slot="leading" name="temporal-logo" />
        Menu
      </MenuButton>
      <Menu id={context.id} class="w-64" {...args}>
        <MenuItem href="https://temporal.io" newTab on:click={action('click')}>
          Link
        </MenuItem>
        <MenuItem disabled href="https://temporal.io">Disabled Link</MenuItem>
        <MenuItem on:click={action('click')} selected>Selected</MenuItem>
        <MenuItem
          on:click={action('click')}
          description="Selected description"
          selected>Selected With Description</MenuItem
        >
        <MenuItem on:click={action('click')}>Standard</MenuItem>
        <MenuItem on:click={action('click')} description="Standard description"
          >Standard With Description</MenuItem
        >
        <MenuItem on:click={action('click')} destructive>Destructive</MenuItem>
      </Menu>
    </MenuContainer>
  </div>
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

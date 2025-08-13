<script lang="ts" module>
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

<Story name="Edge Avoidance - Right Edge">
  <div class="flex h-screen w-screen items-start justify-end p-4">
    <MenuContainer>
      <MenuButton hasIndicator variant="primary" controls="edge-right">
        <Icon slot="leading" name="temporal-logo" />
        Right Edge Menu
      </MenuButton>
      <Menu id="edge-right" class="w-64" position="left">
        <MenuItem
          >This menu should flip to the right when near the right edge</MenuItem
        >
        <MenuItem>Item 2</MenuItem>
        <MenuItem>Item 3</MenuItem>
      </Menu>
    </MenuContainer>
  </div>
</Story>

<Story name="Edge Avoidance - Left Edge">
  <div class="flex h-screen w-screen items-start justify-start p-4">
    <MenuContainer>
      <MenuButton hasIndicator variant="primary" controls="edge-left">
        <Icon slot="leading" name="temporal-logo" />
        Left Edge Menu
      </MenuButton>
      <Menu id="edge-left" class="w-64" position="right">
        <MenuItem
          >This menu should flip to the left when near the left edge</MenuItem
        >
        <MenuItem>Item 2</MenuItem>
        <MenuItem>Item 3</MenuItem>
      </Menu>
    </MenuContainer>
  </div>
</Story>

<Story name="Edge Avoidance - Top Edge">
  <div class="flex h-screen w-screen items-start justify-center p-4">
    <MenuContainer>
      <MenuButton hasIndicator variant="primary" controls="edge-top">
        <Icon slot="leading" name="temporal-logo" />
        Top Edge Menu
      </MenuButton>
      <Menu id="edge-top" class="w-64" position="top-left">
        <MenuItem>This menu should flip down when near the top edge</MenuItem>
        <MenuItem>Item 2</MenuItem>
        <MenuItem>Item 3</MenuItem>
        <MenuItem>Item 4</MenuItem>
        <MenuItem>Item 5</MenuItem>
      </Menu>
    </MenuContainer>
  </div>
</Story>

<Story name="Escape Key Test">
  <div class="flex h-screen w-screen items-center justify-center">
    <MenuContainer>
      <MenuButton hasIndicator variant="primary" controls="escape-test">
        <Icon slot="leading" name="temporal-logo" />
        Press ESC to close
      </MenuButton>
      <Menu id="escape-test" class="w-64">
        <MenuItem>Press Escape key to close this menu</MenuItem>
        <MenuItem>Tab through items and press Escape</MenuItem>
        <MenuItem>Works from anywhere in the menu</MenuItem>
      </Menu>
    </MenuContainer>
  </div>
</Story>

<Story name="Window Resize Test">
  <div class="flex h-screen w-screen items-start justify-end p-4">
    <div class="text-center">
      <p class="text-gray-600 mb-4 text-sm">
        Open the menu below, then resize your browser window to see edge
        avoidance in action
      </p>
      <MenuContainer>
        <MenuButton hasIndicator variant="primary" controls="resize-test">
          <Icon slot="leading" name="temporal-logo" />
          Resize Test Menu
        </MenuButton>
        <Menu id="resize-test" class="w-64" position="left">
          <MenuItem>Resize the browser window</MenuItem>
          <MenuItem>Menu will adjust position automatically</MenuItem>
          <MenuItem>Try making window narrower</MenuItem>
          <MenuItem>Or taller/shorter</MenuItem>
          <MenuItem>Edge avoidance responds to resize</MenuItem>
        </Menu>
      </MenuContainer>
    </div>
  </div>
</Story>

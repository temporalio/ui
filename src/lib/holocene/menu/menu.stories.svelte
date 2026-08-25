<script lang="ts" module>
  import { defineMeta, type StoryContext } from '@storybook/addon-svelte-csf';
  import { action } from 'storybook/actions';
  import type { ComponentProps } from 'svelte';

  import { IconTemporal } from '$lib/io/icon';

  import { shouldNotBeTransparent } from '../test-utilities';

  import MenuButton from './menu-button.svelte';
  import MenuContainer from './menu-container.svelte';
  import MenuItem from './menu-item.svelte';
  import Menu from './menu.svelte';

  type MenuArgs = {
    variant?: ComponentProps<typeof MenuButton>['variant'];
    keepOpen?: ComponentProps<typeof Menu>['keepOpen'];
    position?: ComponentProps<typeof Menu>['position'];
    menuElement?: ComponentProps<typeof Menu>['menuElement'];
  };

  const { Story } = defineMeta({
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
    render: template,
  });
</script>

{#snippet template(args: MenuArgs, context: StoryContext<MenuArgs>)}
  <div class="flex items-center justify-center">
    <MenuContainer>
      <MenuButton hasIndicator variant={args.variant} controls={context.id}>
        {#snippet leading()}
          <IconTemporal />
        {/snippet}
        Menu
      </MenuButton>
      <Menu
        id={context.id}
        class="w-64"
        keepOpen={args.keepOpen}
        position={args.position}
      >
        <MenuItem href="https://temporal.io" newTab onclick={action('click')}>
          Link
        </MenuItem>
        <MenuItem disabled href="https://temporal.io">Disabled Link</MenuItem>
        <MenuItem onclick={action('click')} selected>Selected</MenuItem>
        <MenuItem
          onclick={action('click')}
          description="Selected description"
          selected>Selected With Description</MenuItem
        >
        <MenuItem onclick={action('click')}>Standard</MenuItem>
        <MenuItem onclick={action('click')} description="Standard description"
          >Standard With Description</MenuItem
        >
        <MenuItem onclick={action('click')} destructive>Destructive</MenuItem>
      </Menu>
    </MenuContainer>
  </div>
{/snippet}

<Story name="Primary" args={{ variant: 'primary' }} />

<Story
  name="Secondary"
  args={{ variant: 'secondary' }}
  play={shouldNotBeTransparent((canvas) => canvas.getByRole('button'))}
/>

<Story name="Ghost" args={{ variant: 'ghost' }} />

<Story name="Keep Open" args={{ keepOpen: true }} />

<Story name="Right" args={{ position: 'right' }} />

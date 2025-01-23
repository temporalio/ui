<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
    type StoryContext,
  } from '@storybook/addon-svelte-csf';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuItem,
  } from '$lib/holocene/menu';
  import type { MenuButtonVariant } from '$lib/holocene/menu/menu-button.svelte';

  const { Story } = defineMeta<typeof MenuButton | typeof Menu>({
    title: 'Menu',
    component: MenuButton,
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
  });
</script>

<script lang="ts">
  import { action } from '@storybook/addon-actions';

  import { shouldNotBeTransparent } from '../test-utilities';

  setTemplate(template);
</script>

{#snippet template(
  args: Args<typeof Story> & { variant: MenuButtonVariant },
  context: StoryContext<typeof Story>,
)}
  <div class="flex items-center justify-center">
    <MenuContainer>
      <MenuButton hasIndicator variant={args.variant} controls={context.id}>
        {#snippet leading()}
          <Icon name="temporal-logo" />
        {/snippet}
        Menu
      </MenuButton>
      <Menu id={context.id} class="w-64" {...args}>
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

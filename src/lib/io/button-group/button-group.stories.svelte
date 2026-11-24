<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import { IconAdd, IconChevronDown } from '$lib/io/icon';

  import type { ButtonColorScheme, ButtonSize } from '../button';

  import ButtonGroupButton from './button-group-button.svelte';
  import ButtonGroupLink from './button-group-link.svelte';
  import ButtonGroup from './button-group.svelte';

  const colorSchemes: ButtonColorScheme[] = [
    'primary',
    'secondary',
    'tertiary',
    'ghost',
    'danger',
  ];
  const sizes: ButtonSize[] = ['md', 'sm', 'xs'];

  const { Story } = defineMeta({
    title: 'IO/Components/Button Group',
    tags: ['autodocs'],
    component: ButtonGroup,
    args: {
      colorScheme: 'tertiary',
      size: 'md',
      roundness: 'base',
      innerBorderHandling: 'collapse',
    },
    argTypes: {
      colorScheme: { control: 'select', options: colorSchemes },
      size: { control: 'select', options: sizes },
      roundness: {
        control: 'select',
        options: ['none', 'sm', 'base', 'lg', 'full'],
      },
      innerBorderHandling: {
        control: 'select',
        options: ['none', 'collapse'],
      },
      children: {
        control: false,
        table: { category: 'properties', type: { summary: 'Snippet' } },
      },
      class: { table: { disable: true } },
    },
    parameters: {
      docs: {
        description: {
          component:
            'Joins adjacent buttons. `ButtonGroupButton` and `ButtonGroupLink` always use the group’s size and take its color scheme unless they set their own; plain `Button`s inside the group, such as those in a menu, are unaffected.',
        },
      },
      layout: 'padded',
    },
  });
</script>

{#snippet template(args: ComponentProps<typeof ButtonGroup>)}
  <div class="bg-background-primary p-6 text-primary">
    <ButtonGroup {...args}>
      <ButtonGroupButton>First</ButtonGroupButton>
      <ButtonGroupButton>Second</ButtonGroupButton>
      <ButtonGroupButton>Third</ButtonGroupButton>
    </ButtonGroup>
  </div>
{/snippet}

<Story tags={['!dev']} name="Playground" {template} />

<Story name="Color schemes and sizes">
  {#snippet template(args)}
    <div class="overflow-x-auto bg-background-primary p-6 text-primary">
      <table class="border-separate border-spacing-4">
        <caption class="text-left text-sm text-secondary">
          Groups across all color schemes and sizes.
        </caption>
        <thead>
          <tr>
            <th scope="col" class="text-left text-xs text-secondary">Size</th>
            {#each colorSchemes as colorScheme (colorScheme)}
              <th scope="col" class="text-left text-xs text-secondary">
                {colorScheme}
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each sizes as size (size)}
            <tr>
              <th scope="row" class="text-left text-xs text-secondary"
                >{size}</th
              >
              {#each colorSchemes as colorScheme (colorScheme)}
                <td>
                  <ButtonGroup {...args} {size} {colorScheme}>
                    <ButtonGroupButton>One</ButtonGroupButton>
                    <ButtonGroupButton>Two</ButtonGroupButton>
                    <ButtonGroupButton>Three</ButtonGroupButton>
                  </ButtonGroup>
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/snippet}
</Story>

<Story name="Split button" args={{ colorScheme: 'primary' }}>
  {#snippet template(args)}
    <div class="bg-background-primary p-6 text-primary">
      <ButtonGroup {...args}>
        <ButtonGroupButton LeadingIcon={IconAdd}>Create</ButtonGroupButton>
        <ButtonGroupButton
          TrailingIcon={IconChevronDown}
          aria-label="More create options"
        ></ButtonGroupButton>
      </ButtonGroup>
    </div>
  {/snippet}
</Story>

<Story name="Button overrides">
  {#snippet template(args)}
    <div class="bg-background-primary p-6 text-primary">
      <ButtonGroup {...args}>
        <ButtonGroupButton>Inherited</ButtonGroupButton>
        <ButtonGroupButton colorScheme="primary"
          >Own color scheme</ButtonGroupButton
        >
      </ButtonGroup>
    </div>
  {/snippet}
</Story>

<Story name="Links">
  {#snippet template(args)}
    <div class="bg-background-primary p-6 text-primary">
      <ButtonGroup {...args}>
        <ButtonGroupLink href="https://docs.temporal.io">Docs</ButtonGroupLink>
        <ButtonGroupLink href="https://temporal.io/blog">Blog</ButtonGroupLink>
        <ButtonGroupLink href="https://community.temporal.io"
          >Community</ButtonGroupLink
        >
      </ButtonGroup>
    </div>
  {/snippet}
</Story>

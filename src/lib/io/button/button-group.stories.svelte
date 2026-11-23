<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import { IconAdd, IconChevronDown } from '$lib/io/icon';

  import type { ButtonColorScheme, ButtonSize } from './recipe';

  import ButtonGroup from './button-group.svelte';
  import Button from './button.svelte';
  import ButtonLink from './link.svelte';

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
            'Joins adjacent buttons and shares a color scheme and size with them. A button’s own props take precedence.',
        },
      },
      layout: 'padded',
    },
  });
</script>

{#snippet template(args: ComponentProps<typeof ButtonGroup>)}
  <div class="bg-background-primary p-6 text-primary">
    <ButtonGroup {...args}>
      <Button>First</Button>
      <Button>Second</Button>
      <Button>Third</Button>
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
                    <Button>One</Button>
                    <Button>Two</Button>
                    <Button>Three</Button>
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
        <Button LeadingIcon={IconAdd}>Create</Button>
        <Button TrailingIcon={IconChevronDown} aria-label="More create options"
        ></Button>
      </ButtonGroup>
    </div>
  {/snippet}
</Story>

<Story name="Button overrides">
  {#snippet template(args)}
    <div class="bg-background-primary p-6 text-primary">
      <ButtonGroup {...args}>
        <Button>Inherited</Button>
        <Button colorScheme="primary">Own color scheme</Button>
        <Button size="sm">Own size</Button>
      </ButtonGroup>
    </div>
  {/snippet}
</Story>

<Story name="Links">
  {#snippet template(args)}
    <div class="bg-background-primary p-6 text-primary">
      <ButtonGroup {...args}>
        <ButtonLink href="https://docs.temporal.io">Docs</ButtonLink>
        <ButtonLink href="https://temporal.io/blog">Blog</ButtonLink>
        <ButtonLink href="https://community.temporal.io">Community</ButtonLink>
      </ButtonGroup>
    </div>
  {/snippet}
</Story>

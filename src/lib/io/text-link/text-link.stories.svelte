<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import { IconAdd, IconArrowUpRight } from '$lib/io/icon';

  import TextLink from './text-link.svelte';

  const { Story } = defineMeta({
    title: 'IO/Components/Text Link',
    component: TextLink,
    args: {
      href: 'https://docs.temporal.io',
      disabled: false,
    },
    argTypes: {
      href: { control: 'text' },
      target: { control: 'select', options: ['_self', '_blank'] },
      disabled: { control: 'boolean' },
      LeadingIcon: {
        control: 'select',
        options: ['None', 'Add'],
        mapping: { None: undefined, Add: IconAdd },
      },
      TrailingIcon: {
        control: 'select',
        options: ['None', 'Arrow up right'],
        mapping: { None: undefined, 'Arrow up right': IconArrowUpRight },
      },
      children: { control: false },
      class: { table: { disable: true } },
    },
    parameters: {
      docs: {
        description: {
          component:
            'An inline navigation link with optional leading and trailing icons.',
        },
      },
      layout: 'padded',
    },
  });
</script>

{#snippet template(args: ComponentProps<typeof TextLink>)}
  <div
    class="bg-background-primary p-6 text-xs font-normal leading-4 text-primary"
  >
    <TextLink {...args}>Documentation</TextLink>
  </div>
{/snippet}

<Story tags={['!dev']} name="Text only" {template} />
<Story name="Leading icon" args={{ LeadingIcon: IconAdd }} {template} />
<Story
  name="Trailing icon"
  args={{ TrailingIcon: IconArrowUpRight }}
  {template}
/>
<Story
  name="Both icons"
  args={{ LeadingIcon: IconAdd, TrailingIcon: IconArrowUpRight }}
  {template}
/>
<Story name="Disabled" args={{ disabled: true }} {template} />
<Story
  name="New tab"
  args={{ target: '_blank', TrailingIcon: IconArrowUpRight }}
  {template}
/>

<Story name="Inline text">
  {#snippet template(args)}
    <div
      class="max-w-sm bg-background-primary p-6 text-xs leading-4 text-primary"
    >
      Read the <TextLink {...args}>Temporal documentation</TextLink> for more information
      about workflows and activities.
    </div>
  {/snippet}
</Story>

<Story name="Inherited typography">
  {#snippet template(args)}
    <div class="space-y-4 bg-background-primary p-6 text-primary">
      {#each ['text-xs leading-4', 'text-base leading-6', 'text-xl font-semibold leading-8'] as typography (typography)}
        <p class={typography}>
          Read the <TextLink {...args}>documentation</TextLink> or
          <TextLink {...args} TrailingIcon={IconArrowUpRight}
            >open the guide</TextLink
          >.
        </p>
      {/each}
    </div>
  {/snippet}
</Story>

<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import usage from './breadcrumbs.usage.md?raw';

  import Breadcrumbs from './breadcrumbs.svelte';

  const { Story } = defineMeta({
    title: 'Components/Breadcrumbs',
    tags: ['autodocs'],
    component: Breadcrumbs,
    args: {
      items: [
        { label: 'Namespaces', href: '/namespaces' },
        { label: 'production', href: '/namespaces/production' },
      ],
    },
    argTypes: {
      items: { control: 'object' },
      'aria-label': {
        control: 'text',
        table: {
          category: 'properties',
          type: { summary: 'string' },
          defaultValue: { summary: '"Breadcrumbs" (translated)' },
        },
      },
      class: { table: { disable: true } },
    },
    parameters: {
      docs: {
        group: 'Actions and navigation',
        description: {
          component:
            'Shows where a page sits in the hierarchy and links to each level above it.',
        },
        usage,
      },
      layout: 'padded',
    },
  });
</script>

{#snippet template(args: ComponentProps<typeof Breadcrumbs>)}
  <Breadcrumbs {...args} />
{/snippet}

<Story tags={['!dev']} name="Short trail" {template} />

<Story
  name="Multi-level trail"
  args={{
    items: [
      { label: 'Namespaces', href: '/namespaces' },
      { label: 'production', href: '/namespaces/production' },
      { label: 'Workflows', href: '/namespaces/production/workflows' },
      {
        label: 'order-processing',
        href: '/namespaces/production/workflows/order-processing',
      },
    ],
  }}
  {template}
/>

<Story
  name="Current page only"
  args={{ items: [{ label: 'Namespaces', href: '/namespaces' }] }}
  {template}
/>

<Story
  name="Caller classes"
  args={{
    class: 'text-sm leading-5',
    items: [
      { label: 'Namespaces', href: '/namespaces', class: 'font-semibold' },
      {
        label: 'production',
        href: '/namespaces/production',
        class: 'font-semibold',
      },
    ],
  }}
  {template}
/>

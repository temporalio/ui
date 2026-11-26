<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import usage from './breadcrumbs.usage.md?raw';

  import Breadcrumbs from './breadcrumbs.svelte';

  const { Story } = defineMeta({
    title: 'IO/Components/Breadcrumbs',
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
        description: {
          component:
            'Pass items in route order, each with a label and href. The final item is always marked as the current page; separators appear only between items. Each item accepts native link attributes and a class override. Decorative separators are included inside ancestor links. The default aria-label is translated; override it to distinguish multiple navigation landmarks.',
        },
        usage,
      },
      layout: 'padded',
    },
  });
</script>

{#snippet template(args: ComponentProps<typeof Breadcrumbs>)}
  <div class="bg-background-primary p-6">
    <Breadcrumbs {...args} />
  </div>
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

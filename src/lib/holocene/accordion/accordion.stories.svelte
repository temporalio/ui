<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import { iconNames } from '$lib/holocene/icon';

  import Accordion from './accordion.svelte';

  interface AccordionProps {
    title: string;
    subtitle?: string;
    open?: boolean;
    expandable?: boolean;
    error?: string;
    icon?: string;
    onToggle?: () => void;
  }

  export const meta: Meta<AccordionProps> = {
    title: 'Accordion',
    component: Accordion,
    args: {
      title: 'Accordion Title',
      subtitle: 'Subtitle',
      open: false,
      expandable: true,
      error: '',
    },
    argTypes: {
      title: { control: 'text' },
      subtitle: { control: 'text' },
      open: { control: 'boolean' },
      expandable: { control: 'boolean' },
      error: { control: 'text' },
      icon: { control: 'select', options: iconNames },
    },
  };
</script>

<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Story, Template } from '@storybook/addon-svelte-csf';

  import Link from '../link.svelte';

  import AccordionGroup from './accordion-group.svelte';
</script>

<Template let:args>
  <div class="flex flex-col gap-2">
    <Accordion {...args} onToggle={action('onToggle')}>
      <p>Accordion Content</p>
    </Accordion>
    <AccordionGroup>
      <Accordion {...args} onToggle={action('onToggle')}>
        <p>Accordion Content</p>
      </Accordion>
      <Accordion {...args} onToggle={action('onToggle')}>
        <p>Accordion Content</p>
      </Accordion>
      <Accordion {...args} onToggle={action('onToggle')}>
        <p>Accordion Content</p>
      </Accordion>
    </AccordionGroup>
  </div>
</Template>

<Story name="Default" args={{ open: false }} />

<Story name="Not Expandable" args={{ expandable: false }} />

<Story name="With Error" args={{ error: 'Error' }} />

<Story name="With Icon" args={{ icon: 'workflow' }} />

<Story
  name="With Action"
  let:args
  parameters={{
    a11y: {
      disable: true,
    },
  }}
>
  <Accordion {...args} onToggle={action('onToggle')}>
    <p>Accordion Content</p>
    <Link href="https://docs.temporal.io/" newTab slot="action" icon="book">
      <span class="sr-only">docs</span>
    </Link>
  </Accordion>
</Story>

<Story name="With Summary" let:args>
  <Accordion {...args} onToggle={action('onToggle')}>
    <p slot="summary">Accordion Summary</p>
    <p>Accordion Content</p>
  </Accordion>
</Story>

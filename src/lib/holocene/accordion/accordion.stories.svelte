<script lang="ts" module>
  import type { Meta } from '@storybook/svelte';
  import type { ComponentProps } from 'svelte';

  import { iconNames } from '$lib/holocene/icon';

  import Accordion from './accordion.svelte';

  export const meta = {
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
      title: { name: 'Title', control: 'text' },
      subtitle: { name: 'Subtitle', control: 'text' },
      open: { name: 'Open', control: 'boolean' },
      expandable: { name: 'Expandable', control: 'boolean' },
      error: { name: 'Error', control: 'text' },
      icon: {
        name: 'Icon',
        control: 'select',
        options: iconNames,
      },
    },
  } satisfies Meta<ComponentProps<typeof Accordion>>;
</script>

<script lang="ts">
  import { action as logAction } from '@storybook/addon-actions';
  import { Story, Template } from '@storybook/addon-svelte-csf';

  import Link from '../link.svelte';

  import AccordionGroup from './accordion-group.svelte';
</script>

<Template let:args>
  <div class="flex flex-col gap-2">
    <Accordion {...args} onToggle={logAction('onToggle')}>
      <p>Accordion Content</p>
    </Accordion>
    <AccordionGroup>
      <Accordion {...args} onToggle={logAction('onToggle')}>
        <p>Accordion Content</p>
      </Accordion>
      <Accordion {...args} onToggle={logAction('onToggle')}>
        <p>Accordion Content</p>
      </Accordion>
      <Accordion {...args} onToggle={logAction('onToggle')}>
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
  <Accordion {...args} onToggle={logAction('onToggle')}>
    <p>Accordion Content</p>
    {#snippet action()}
      <Link href="https://docs.temporal.io/" newTab icon="book">
        <span class="sr-only">docs</span>
      </Link>
    {/snippet}
  </Accordion>
</Story>

<Story name="With Summary" let:args>
  <Accordion {...args} onToggle={logAction('onToggle')}>
    {#snippet summary()}
      <p>Accordion Summary</p>
    {/snippet}
    <p>Accordion Content</p>
  </Accordion>
</Story>

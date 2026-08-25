<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { action as logAction } from 'storybook/actions';
  import { fn } from 'storybook/test';
  import type { ComponentProps } from 'svelte';

  import * as ioIcons from '$lib/io/icon';
  import { IconBook } from '$lib/io/icon';

  import Link from '../link.svelte';

  import AccordionGroup from './accordion-group.svelte';
  import Accordion from './accordion.svelte';

  const iconOptions: Record<string, unknown> = { ...ioIcons };

  const { Story } = defineMeta({
    title: 'Accordion',
    component: Accordion,
    args: {
      title: 'Accordion Title',
      subtitle: 'Subtitle',
      open: false,
      expandable: true,
      error: '',
      onToggle: fn(),
    },
    argTypes: {
      title: { name: 'Title', control: 'text' },
      subtitle: { name: 'Subtitle', control: 'text' },
      open: { name: 'Open', control: 'boolean' },
      expandable: { name: 'Expandable', control: 'boolean' },
      error: { name: 'Error', control: 'text' },
      Icon: {
        name: 'Icon',
        control: 'select',
        options: Object.keys(iconOptions),
        mapping: iconOptions,
      },
    },
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof Accordion>)}
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
{/snippet}

<Story name="Default" args={{ open: false }} />

<Story name="Not Expandable" args={{ expandable: false }} />

<Story name="With Error" args={{ error: 'Error' }} />

<Story name="With Icon" args={{ Icon: ioIcons.IconTemporalWorkflow }} />

<Story
  name="With Action"
  parameters={{
    a11y: {
      disable: true,
    },
  }}
>
  {#snippet template(args)}
    <Accordion {...args} onToggle={logAction('onToggle')}>
      <p>Accordion Content</p>
      {#snippet action()}
        <Link href="https://docs.temporal.io/" newTab LeadingIcon={IconBook}>
          <span class="sr-only">docs</span>
        </Link>
      {/snippet}
    </Accordion>
  {/snippet}
</Story>

<Story name="With Summary">
  {#snippet template(args)}
    <Accordion {...args} onToggle={logAction('onToggle')}>
      {#snippet summary()}
        <p>Accordion Summary</p>
      {/snippet}
      <p>Accordion Content</p>
    </Accordion>
  {/snippet}
</Story>

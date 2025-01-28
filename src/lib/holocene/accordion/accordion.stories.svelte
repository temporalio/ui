<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
  } from '@storybook/addon-svelte-csf';

  import { iconNames } from '$lib/holocene/icon';

  import Accordion from './accordion.svelte';

  const { Story } = defineMeta({
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
  });
</script>

<script lang="ts">
  import { action as storyAction } from '@storybook/addon-actions';

  import Link from '../link.svelte';

  import AccordionGroup from './accordion-group.svelte';

  setTemplate(template);
</script>

{#snippet template({ title, ...args }: Args<typeof Story>)}
  <div class="flex flex-col gap-2">
    <Accordion {title} {...args} onToggle={storyAction('onToggle')}>
      <p>Accordion Content</p>
    </Accordion>
    <AccordionGroup>
      <Accordion {title} {...args} onToggle={storyAction('onToggle')}>
        <p>Accordion Content</p>
      </Accordion>
      <Accordion {title} {...args} onToggle={storyAction('onToggle')}>
        <p>Accordion Content</p>
      </Accordion>
      <Accordion {title} {...args} onToggle={storyAction('onToggle')}>
        <p>Accordion Content</p>
      </Accordion>
    </AccordionGroup>
  </div>
{/snippet}

<Story name="Default" args={{ open: false }} />

<Story name="Not Expandable" args={{ expandable: false }} />

<Story name="With Error" args={{ error: 'Error' }} />

<Story name="With Icon" args={{ icon: 'workflow' }} />

<Story
  name="With Action"
  parameters={{
    a11y: {
      disable: true,
    },
  }}
>
  {#snippet children({ title, ...args })}
    <Accordion {title} {...args} onToggle={storyAction('onToggle')}>
      <p>Accordion Content</p>
      {#snippet action()}
        <Link href="https://docs.temporal.io/" newTab icon="book">
          <span class="sr-only">docs</span>
        </Link>
      {/snippet}
    </Accordion>
  {/snippet}
</Story>

<Story name="With Summary">
  {#snippet children({ title, ...args })}
    <Accordion {title} {...args} onToggle={storyAction('onToggle')}>
      {#snippet summary()}
        <p>Accordion Summary</p>
      {/snippet}
      <p>Accordion Content</p>
    </Accordion>
  {/snippet}
</Story>

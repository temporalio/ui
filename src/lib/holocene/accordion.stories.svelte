<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import { iconNames } from '$lib/holocene/icon';

  console.log(iconNames);

  import Accordion from './accordion.svelte';

  export const meta = {
    title: 'Accordion',
    component: Accordion,
    args: {
      title: 'Accordion Title',
      subtitle: 'Subtitle',
      disabled: false,
      open: false,
      readOnly: false,
      error: '',
    },
    argTypes: {
      title: { name: 'Title', control: 'text' },
      subtitle: { name: 'Subtitle', control: 'text' },
      open: { name: 'Open', control: 'boolean' },
      disabled: { name: 'Disabled', control: 'boolean' },
      readOnly: { name: 'Read Only', control: 'boolean' },
      error: { name: 'Error', control: 'text' },
      icon: {
        name: 'Icon',
        control: 'select',
        options: iconNames,
      },
    },
  } satisfies Meta<Accordion>;
</script>

<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
  <Accordion {...args} onToggle={action('onToggle')}>
    <p>Accordion Content</p>
  </Accordion>
</Template>

<Story name="Default" />

<Story name="Open" args={{ open: true }} />

<Story name="Disabled" args={{ disabled: true }} />

<Story name="With Error" args={{ error: 'Error' }} />

<Story name="With Icon" args={{ icon: 'workflow' }} />

<Story
  name="Accordion (Dark)"
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Open (Dark)"
  args={{
    open: true,
  }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Disabled (Dark)"
  args={{ disabled: true }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="With Error (Dark)"
  args={{ error: 'Error' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="With Icon (Dark)"
  args={{ icon: 'workflow' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

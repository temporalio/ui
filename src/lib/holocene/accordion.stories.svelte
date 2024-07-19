<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import { iconNames } from '$lib/holocene/icon';

  import Accordion from './accordion.svelte';

  export const meta = {
    title: 'Accordion',
    component: Accordion,
    args: {
      title: 'Accordion Title',
      subtitle: 'Subtitle',
      open: false,
      error: '',
    },
    argTypes: {
      title: { name: 'Title', control: 'text' },
      subtitle: { name: 'Subtitle', control: 'text' },
      open: { name: 'Open', control: 'boolean' },
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

<Story name="Default" args={{ open: true }} />

<Story name="With Error" args={{ error: 'Error' }} />

<Story name="With Icon" args={{ icon: 'workflow' }} />

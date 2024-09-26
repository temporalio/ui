<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  export const meta = {
    title: 'Alert',
    component: Alert,
    args: {
      title: 'Alert Title',
      intent: 'info',
      hidden: false,
    },
    argTypes: {
      title: { control: 'text' },
      intent: {
        control: 'select',
        options: ['info', 'success', 'warning', 'error'],
      },
      icon: {
        control: 'select',
        options: ['info', 'success', 'warning', 'error'],
      },
      hidden: { table: { disable: true } },
    },
  } satisfies Meta<Alert>;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';

  import Alert from './alert.svelte';
</script>

<Template let:args>
  <Alert {...args}>
    <p>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut cupiditate
      exercitationem quia quibusdam excepturi rem saepe dolore quas, odit vero
      sed rerum necessitatibus minima nobis, ullam minus inventore voluptates
      itaque?
    </p>
  </Alert>
</Template>

<Story name="Information" args={{ intent: 'info' }} />

<Story name="Error" args={{ intent: 'error' }} />

<Story name="Success" args={{ intent: 'success' }} />

<Story name="Warning" args={{ intent: 'warning' }} />

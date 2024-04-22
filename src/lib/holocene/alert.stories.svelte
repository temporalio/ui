<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  export const meta = {
    title: 'Alert',
    component: Alert,
    args: {
      title: 'Alert Title',
      intent: 'info',
      bold: false,
      hidden: false,
    },
    argTypes: {
      title: { control: 'text' },
      intent: {
        control: 'select',
        options: ['Information', 'Success', 'Warning', 'Error'],
        mapping: {
          Information: 'info',
          Success: 'success',
          Warning: 'warning',
          Error: 'error',
        },
      },
      icon: {
        control: {
          type: 'select',
          options: ['Information', 'Success', 'Warning', 'Error'],
          mapping: {
            Information: 'info',
            Success: 'success',
            Warning: 'warning',
            Error: 'error',
          },
        },
      },
      class: { table: { disable: true } },
      hidden: { table: { disable: true } },
    },
  } satisfies Meta;
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

<Story
  name="Information (Dark)"
  args={{ intent: 'info' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Error (Dark)"
  args={{ intent: 'error' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Success (Dark)"
  args={{ intent: 'success' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Warning (Dark)"
  args={{ intent: 'warning' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

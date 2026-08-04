<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import Alert from './alert.svelte';

  const { Story } = defineMeta({
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
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof Alert>)}
  <Alert {...args}>
    <p>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut cupiditate
      exercitationem quia quibusdam excepturi rem saepe dolore quas, odit vero
      sed rerum necessitatibus minima nobis, ullam minus inventore voluptates
      itaque?
    </p>
  </Alert>
{/snippet}

<Story name="Information" args={{ intent: 'info' }} />

<Story name="Error" args={{ intent: 'error' }} />

<Story name="Success" args={{ intent: 'success' }} />

<Story name="Warning" args={{ intent: 'warning' }} />

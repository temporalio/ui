<script lang="ts">
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

  import iconNames from './icon';

  import Alert from './alert.svelte';
</script>

<Meta
  title="Alert"
  component={Alert}
  argTypes={{
    intent: {
      control: 'select',
      options: ['info', 'error', 'warning', 'success'],
    },
    icon: {
      control: 'select',
      options: iconNames,
    },
  }}
/>

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

<Story
  name="alert"
  args={{ title: 'Alert Title', intent: 'info', icon: 'info' }}
/>

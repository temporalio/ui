<script lang="ts">
  import '../app.css';
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import Button from '../lib/components/button.svelte';
</script>

<Meta
  title="Button"
  component={Button}
  argTypes={{
    disabled: {
      name: 'Disabled',
      defaultValue: false,
      control: 'boolean',
    },
    secondary: {
      name: 'Secondary',
      defaultValue: false,
      control: 'boolean',
    },
    destroy: {
      name: 'Destroy',
      defaultValue: false,
      control: 'boolean',
    },
    loading: {
      name: 'Loading',
      defaultValue: false,
      control: 'boolean',
    },
    thin: {
      name: 'Thin',
      defaultValue: false,
      control: 'boolean',
    },
    login: {
      name: 'Login',
      defaultValue: false,
      control: 'boolean',
    },
    active: {
      name: 'Active',
      defaultValue: false,
      control: 'boolean',
    },
    large: {
      name: 'Large',
      defaultValue: false,
      control: 'boolean',
    },
  }}
/>

<!-- More on component templates: https://storybook.js.org/docs/svelte/writing-stories/introduction#using-args -->
<Template let:args>
  <Button {...args} on:submit={args.onSubmit} on:input={args.onChange}>
    Button
  </Button>
</Template>

<!-- More on args: https://storybook.js.org/docs/svelte/writing-stories/args -->
<Story name="Default" />

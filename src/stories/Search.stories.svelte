<script lang="ts">
  import '../app.css';
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import Search from '../lib/components/search.svelte';
</script>

<!-- More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export -->
<!-- More on argTypes: https://storybook.js.org/docs/svelte/api/argtypes -->
<Meta
  title="Search Input"
  component={Search}
  argTypes={{
    placeholder: {
      name: 'Placeholder',
      defaultValue: 'Query…',
      control: 'text',
    },
    label: {
      name: 'Button Label',
      defaultValue: 'Search',
      control: 'text',
    },
    icon: {
      name: 'Icon',
      defaultValue: false,
      control: 'boolean',
    },
    onSubmit: { action: 'onSubmit' },
    onChange: { action: 'onChange' },
  }}
/>

<!-- More on component templates: https://storybook.js.org/docs/svelte/writing-stories/introduction#using-args -->
<Template let:args>
  <Search {...args} on:submit={args.onSubmit} on:input={args.onChange} />
</Template>

<!-- More on args: https://storybook.js.org/docs/svelte/writing-stories/args -->
<Story name="Default" />

<Story name="With Icon" args={{ icon: true }} />

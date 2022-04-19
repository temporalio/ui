<script lang="ts">
  import '../app.css';
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import DateElement from '../lib/components/date.svelte';
</script>

<!-- More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export -->
<!-- More on argTypes: https://storybook.js.org/docs/svelte/api/argtypes -->
<Meta
  title="Date"
  component={DateElement}
  argTypes={{
    date: {
      name: 'Date',
      defaultValue: new Date().toString(),
      control: 'text',
    },
  }}
/>

<!-- More on component templates: https://storybook.js.org/docs/svelte/writing-stories/introduction#using-args -->
<Template let:args>
  <DateElement {...args} />
</Template>

<!-- More on args: https://storybook.js.org/docs/svelte/writing-stories/args -->
<Story name="Default" />

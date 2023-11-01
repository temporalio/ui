<script lang="ts">
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

  import RangeInput from '$lib/holocene/input/range-input.svelte';
</script>

<Meta
  title="Range Input"
  component={RangeInput}
  args={{ min: 1, max: 100, value: 50, label: 'Label' }}
  argTypes={{
    id: { control: 'text' },
    label: { control: 'text' },
    value: { control: 'number' },
  }}
/>

<Template let:args>
  <RangeInput {...args} />
</Template>

<Story name="range input" args={{ id: 'range-input-1' }} />

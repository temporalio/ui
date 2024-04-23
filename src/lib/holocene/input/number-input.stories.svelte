<script lang="ts">
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

  import iconNames from '$lib/holocene/icon';
  import NumberInput from '$lib/holocene/input/number-input.svelte';
</script>

<Meta
  title="Number Input"
  component={NumberInput}
  args={{
    label: 'Number Input',
    placeholder: '0',
    units: 'days',
    min: 0,
    max: 100,
  }}
  argTypes={{
    label: { control: 'text' },
    id: { control: 'text' },
    value: { control: 'number' },
    icon: { control: { type: 'select', options: iconNames } },
    name: { control: 'text' },
    max: { control: 'number' },
    min: { control: 'number' },
  }}
/>

<Template let:args>
  <NumberInput {...args} />
</Template>

<Story name="number input" args={{ id: 'number-input-1' }} />

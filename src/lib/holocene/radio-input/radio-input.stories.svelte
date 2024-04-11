<script lang="ts">
  import { writable } from 'svelte/store';

  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

  import RadioGroup from './radio-group.svelte';
  import RadioInput from './radio-input.svelte';

  const value1 = writable('a');
  const value2 = writable(1);
</script>

<Meta
  title="Radio Input"
  component={RadioInput}
  argTypes={{
    value: { control: false },
    label: { control: 'text' },
    id: { control: 'text' },
    name: { control: 'text' },
    group: { control: false },
  }}
/>

<Story
  name="radio input"
  args={{
    disabled: false,
  }}
  template="radio-input"
/>

<Template id="radio-input" let:args>
  <RadioGroup name="option" group={value1}>
    <RadioInput id="option-a" label="Option A" value="a" {...args} />
    <RadioInput id="option-b" label="Option B" value="b" {...args} />
    <RadioInput
      id="option-c"
      label="Option C"
      value="c"
      description="this is a description"
      {...args}
    />
    <p class="text-primary">The value is {$value1}</p>
  </RadioGroup>
</Template>

<Story
  name="without a radio group"
  args={{
    disabled: false,
  }}
  template="no-radio-group"
/>

<Template id="no-radio-group" let:args>
  <div class="flex flex-col gap-2">
    <RadioInput
      id="option-1"
      label="Option 1"
      value={1}
      name="number-option"
      group={value2}
      {...args}
    />
    <RadioInput
      id="option-2"
      label="Option 2"
      value={2}
      name="number-option"
      group={value2}
      {...args}
    />
  </div>
  <p class="mt-2 text-primary">The value is {$value2}</p>
</Template>

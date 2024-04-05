<script lang="ts">
  import { writable } from 'svelte/store';

  import { Meta, Story } from '@storybook/addon-svelte-csf';

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

<Story name="radio input">
  <RadioGroup name="option" group={value1}>
    <RadioInput id="option-a" label="Option A" value="a" />
    <RadioInput id="option-b" label="Option B" value="b" />
    <RadioInput
      id="option-c"
      label="Option C"
      value="c"
      description="this is a description"
    />
    <p class="text-primary">The value is {$value1}</p>
  </RadioGroup>
</Story>
<Story name="without a radio group">
  <div class="flex flex-col gap-2">
    <RadioInput
      id="option-1"
      label="Option 1"
      value={1}
      name="number-option"
      group={value2}
    />
    <RadioInput
      id="option-2"
      label="Option 2"
      value={2}
      name="number-option"
      group={value2}
    />
  </div>
  <p class="mt-2 text-primary">The value is {$value2}</p>
</Story>

<script lang="ts">
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

  import ChipInput from '$lib/holocene/input/chip-input.svelte';
  import { isEmail } from '$lib/utilities/is-email';

  let chips: string[] = ['tobias@temporal.io'];
</script>

<Meta
  title="Chip Input"
  component={ChipInput}
  args={{
    label: 'Chip Input',
    placeholder: 'Placeholder...',
    disabled: false,
    required: false,
    hintText: 'This is the hint text...',
    removeChipButtonLabel: 'Remove',
  }}
  argTypes={{
    chips: { control: false },
    validator: { control: false },
    id: { control: 'text' },
    label: { control: 'text' },
    removeChipButtonLabel: { control: 'text' },
    name: { control: 'text' },
  }}
/>

<Template let:args>
  <ChipInput bind:chips {...args} />
</Template>

<Story name="chip input" args={{ id: 'chip-input-1', validator: isEmail }} />

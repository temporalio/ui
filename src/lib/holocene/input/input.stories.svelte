<script lang="ts">
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

  import { iconNames } from '$lib/holocene/icon/paths';

  import Input from './input.svelte';
</script>

<Meta
  title="Input"
  component={Input}
  args={{
    label: 'Input',
    placeholder: 'Placeholder...',
    labelHidden: false,
    disabled: false,
    clearable: false,
    dark: false,
    copyable: false,
    required: false,
    error: false,
    spellcheck: false,
    theme: 'light',
    hintText: 'This is the hint text',
    clearButtonLabel: 'Clear input',
    copyButtonLabel: 'Copy contents',
  }}
  argTypes={{
    label: { control: 'text' },
    id: { control: 'text' },
    value: { control: 'text' },
    name: { control: 'text' },
    icon: { control: 'select', options: iconNames },
    theme: { control: 'radio', options: ['dark', 'light'] },
    spellcheck: { control: 'boolean' },
  }}
/>

<Template let:args>
  <Input {...args} />
</Template>

<Story args={{ id: 'text-input-1' }} name="input" />

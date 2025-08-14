<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import { iconNames } from '$lib/anthropocene/icon';
  import NumberInput from '$lib/anthropocene/input/number-input.svelte';

  export const meta = {
    title: 'Number Input',
    component: NumberInput,
    args: {
      label: 'Number Input',
      value: 0,
      placeholder: '0',
      units: '',
      min: 0,
      max: 100,
      search: false,
      labelHidden: false,
      disabled: false,
      required: false,
      hintText: '',
    },
    argTypes: {
      label: { name: 'Label', control: 'text' },
      value: { name: 'Value', control: 'number' },
      placeholder: { name: 'Placeholder', control: 'text' },
      units: { name: 'Units', control: 'text' },
      hintText: { name: 'Hint Text', control: 'text' },
      disabled: { name: 'Disabled', control: 'boolean' },
      required: { name: 'Required', control: 'boolean' },
      labelHidden: { name: 'Label Hidden', control: 'boolean' },
      icon: { name: 'Icon', control: 'select', options: iconNames },
      max: { name: 'Minimum Value', control: { type: 'number', min: 0 } },
      min: { name: 'Maximum Value', control: { type: 'number', min: 0 } },
      search: { name: 'Search', control: 'boolean' },
    },
  } satisfies Meta<NumberInput>;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args let:context>
  <NumberInput {...args} id={context.id} />
</Template>

<Story name="Default" />

<Story name="Disabled" args={{ disabled: true }} />

<Story name="Required" args={{ required: true }} />

<Story name="Label Hidden" args={{ labelHidden: true }} />

<Story name="Search" args={{ search: true }} />

<Story name="With Value" args={{ value: 42 }} />

<Story name="With Units" args={{ units: 'days' }} />

<Story name="With Icon" args={{ icon: 'calendar' }} />

<Story name="With Icon and Units" args={{ icon: 'calendar', units: 'weeks' }} />

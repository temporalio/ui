<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import RangeInput from '$lib/holocene/input/range-input.svelte';

  export const meta = {
    title: 'Range Input',
    component: RangeInput,
    args: {
      value: 50,
      min: 1,
      max: 100,
      step: 1,
      label: 'Label',
      required: false,
      labelHidden: false,
    },
    argTypes: {
      label: { name: 'Label', control: 'text' },
      value: { name: 'Value', control: 'number' },
      min: {
        name: 'Minimum Value',
        control: { type: 'number', min: 0 },
        table: { category: 'Attributes' },
      },
      max: {
        name: 'Maximum Value',
        control: { type: 'number', min: 0 },
        table: { category: 'Attributes' },
      },
      step: {
        name: 'Step',
        control: { type: 'number', min: 0 },
        table: { category: 'Attributes' },
      },
      required: {
        name: 'Required',
        control: 'boolean',
        table: { category: 'Attributes' },
      },
      labelHidden: { name: 'Label Hidden', control: 'boolean' },
    },
  } satisfies Meta<RangeInput>;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args let:context>
  <RangeInput {...args} id={context.id} />
</Template>

<Story name="Default" />

<Story name="Required" args={{ required: true }} />

<Story name="Label Hidden" args={{ labelHidden: true }} />

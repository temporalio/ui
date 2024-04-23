<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import RangeInput from '$lib/holocene/input/range-input.svelte';

  export const meta: Meta = {
    title: 'Range Input',
    component: RangeInput,
    args: {
      value: 50,
      min: 1,
      max: 100,
      step: 1,
      label: 'Label',
      required: false,
      disabled: false,
      labelHidden: false,
    },
    argTypes: {
      id: { table: { disable: true } },
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
      disabled: {
        name: 'Disabled',
        control: 'boolean',
        table: { category: 'Attributes' },
      },
      required: {
        name: 'Required',
        control: 'boolean',
        table: { category: 'Attributes' },
      },
      labelHidden: { name: 'Label Hidden', control: 'boolean' },
    },
  } satisfies Meta;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args let:context>
  <RangeInput {...args} id={context.id} />
</Template>

<Story name="Default" />

<Story name="Disabled" args={{ disabled: true }} />

<Story name="Required" args={{ required: true }} />

<Story name="Label Hidden" args={{ labelHidden: true }} />

<Story
  name="Default (Dark)"
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Disabled (Dark)"
  args={{ disabled: true }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Required (Dark)"
  args={{ required: true }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Label Hidden (Dark)"
  args={{ labelHidden: true }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

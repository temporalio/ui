<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
    type StoryContext,
  } from '@storybook/addon-svelte-csf';

  import RangeInput from '$lib/holocene/input/range-input.svelte';

  const { Story } = defineMeta({
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
  });
</script>

<script lang="ts">
  setTemplate(template);
</script>

{#snippet template(
  { value, label, ...args }: Args<typeof Story>,
  context: StoryContext<typeof Story>,
)}
  <RangeInput {value} {label} {...args} id={context.id} />
{/snippet}

<Story name="Default" />

<Story name="Required" args={{ required: true }} />

<Story name="Label Hidden" args={{ labelHidden: true }} />

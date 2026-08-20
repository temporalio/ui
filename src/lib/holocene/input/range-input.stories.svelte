<script lang="ts" module>
  import { defineMeta, type StoryContext } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

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
    render: template,
  });
</script>

{#snippet template(
  args: ComponentProps<typeof RangeInput>,
  context: StoryContext<ComponentProps<typeof RangeInput>>,
)}
  <div
    class="border border-io-border-primary bg-io-surface-primary p-4 text-io-content-primary"
  >
    <RangeInput {...args} id={context.id} />
  </div>
{/snippet}

<Story name="Default" />

<Story name="Required" args={{ required: true }} />

<Story name="Label Hidden" args={{ labelHidden: true }} />

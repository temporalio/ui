<script lang="ts" module>
  import { defineMeta, type StoryContext } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import NumberInput from '$lib/holocene/input/number-input.svelte';
  import * as ioIcons from '$lib/io/icon';

  const iconOptions: Record<string, unknown> = { ...ioIcons };

  const { Story } = defineMeta({
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
      Icon: {
        name: 'Icon',
        control: 'select',
        options: Object.keys(iconOptions),
        mapping: iconOptions,
      },
      max: { name: 'Minimum Value', control: { type: 'number', min: 0 } },
      min: { name: 'Maximum Value', control: { type: 'number', min: 0 } },
      search: { name: 'Search', control: 'boolean' },
    },
    render: template,
  });
</script>

{#snippet template(
  args: ComponentProps<typeof NumberInput>,
  context: StoryContext<ComponentProps<typeof NumberInput>>,
)}
  <NumberInput {...args} id={context.id} />
{/snippet}

<Story name="Default" />

<Story name="Disabled" args={{ disabled: true }} />

<Story name="Required" args={{ required: true }} />

<Story name="Label Hidden" args={{ labelHidden: true }} />

<Story name="Search" args={{ search: true }} />

<Story name="With Value" args={{ value: 42 }} />

<Story name="With Units" args={{ units: 'days' }} />

<Story name="With Icon" args={{ Icon: ioIcons.IconCalendar }} />

<Story
  name="With Icon and Units"
  args={{ Icon: ioIcons.IconCalendar, units: 'weeks' }}
/>

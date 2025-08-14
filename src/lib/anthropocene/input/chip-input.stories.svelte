<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';
  import { userEvent, within } from '@storybook/test';

  import ChipInput from '$lib/anthropocene/input/chip-input.svelte';
  import { isEmail } from '$lib/utilities/is-email';

  export const meta = {
    title: 'Chip Input',
    component: ChipInput,
    args: {
      label: 'Chip Input',
      placeholder: 'Placeholder...',
      disabled: false,
      required: false,
      external: false,
      hintText: 'This is the hint text...',
      removeChipButtonLabel: 'Remove',
      labelHidden: false,
      validator: isEmail,
      maxLength: undefined,
      chips: ['tobias@temporal.io'],
      scrollTo: false,
    },
    argTypes: {
      label: { name: 'Label', control: 'text' },
      placeholder: { name: 'Placeholder', control: 'text' },
      hintText: { name: 'Hint Text', control: 'text' },
      disabled: { name: 'Disabled', control: 'boolean' },
      required: { name: 'Required', control: 'boolean' },
      external: { name: 'External Chips', control: 'boolean' },
      labelHidden: { name: 'Label Hidden', control: 'boolean' },
      chips: { name: 'Chips', table: { disable: true } },
      validator: { table: { disable: true } },
      maxLength: { name: 'Maximum Length', control: 'number' },
      removeChipButtonLabel: {
        name: 'Aria label for remove button',
        control: 'text',
        table: { category: 'Accessibility' },
      },
      scrollTo: { name: 'Scroll To', control: 'boolean' },
    },
  } satisfies Meta<ChipInput>;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args let:context>
  <ChipInput {...args} id={context.id} />
</Template>

<Story name="Default" />

<Story name="External Chips" args={{ external: true }} />

<Story name="Disabled" args={{ disabled: true }} />

<Story name="Required" args={{ required: true }} />

<Story name="Label Hidden" args={{ labelHidden: true }} />

<Story name="Empty" args={{ chips: [] }} />

<Story
  name="Partial Input"
  args={{ chips: [] }}
  play={async ({ canvasElement, id }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId(id);
    await userEvent.type(input, 'bonbon');
  }}
/>

<Story
  name="Partial Input with Chips"
  args={{ chips: ['finn@temporal.io'] }}
  play={async ({ canvasElement, id }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId(id);
    await userEvent.type(input, 'bonbon');
  }}
/>

<Story
  name="Error"
  play={async ({ canvasElement, id }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId(id);
    await userEvent.type(input, 'bonbon');
    await userEvent.keyboard('{enter}');
  }}
/>

<Story
  name="With Maximum Length"
  args={{ maxLength: 10 }}
  play={async ({ canvasElement, id }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId(id);
    await userEvent.click(input);
  }}
/>

<Story
  name="Scroll Input Into View"
  args={{ class: 'max-h-20 w-96', scrollTo: true }}
  play={async ({ canvasElement, id }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId(id);
    await userEvent.type(input, 'finn@temporal.io');
    await userEvent.keyboard('{enter}');
  }}
/>

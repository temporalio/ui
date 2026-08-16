<script lang="ts" module>
  import { defineMeta, type StoryContext } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';
  import type { ComponentProps } from 'svelte';

  import { iconNames } from '$lib/holocene/icon';

  import {
    redesignForcedColorsParameters,
    redesignVisualParameters,
  } from '../../../../.storybook/visual-modes';
  import Button from '../button.svelte';

  import Input from './input.svelte';

  const { Story } = defineMeta({
    title: 'Input',
    component: Input,
    args: {
      value: '',
      label: 'Input Label',
      placeholder: 'Placeholder...',
      labelHidden: false,
      disabled: false,
      clearable: false,
      copyable: false,
      required: false,
      error: false,
      spellcheck: false,
      autocomplete: 'off',
      suffix: '',
      valid: true,
      hintText: '',
      clearButtonLabel: 'Clear input',
      copyButtonLabel: 'Copy contents',
      onClear: fn(),
    },
    argTypes: {
      label: { name: 'Label', control: 'text' },
      value: { name: 'Value', control: 'text' },
      placeholder: { name: 'Placeholder', control: 'text' },
      required: { name: 'Required', control: 'boolean' },
      error: { name: 'Error', control: 'boolean' },
      disabled: { name: 'Disabled', control: 'boolean' },
      valid: { name: 'Valid', control: 'boolean' },
      autocomplete: {
        name: 'Autocomplete',
        control: 'inline-radio',
        options: ['on', 'off'],
      },
      autoFocus: { name: 'Auto Focus', control: 'boolean' },
      hintText: { name: 'Hint Text', control: 'text' },
      suffix: { name: 'Suffix', control: 'text' },
      labelHidden: { name: 'Label Hidden', control: 'boolean' },
      clearable: { name: 'Clearable', control: 'boolean' },
      copyable: { name: 'Copyable', control: 'boolean' },
      icon: { name: 'Icon', control: 'select', options: iconNames },
      spellcheck: { name: 'Spell Check', control: 'boolean' },
      maxLength: { name: 'Max Length', control: 'number' },
      hideCount: { name: 'Hide Count', control: 'boolean' },
      copyButtonLabel: {
        name: 'Copy Button Label',
        control: 'text',
        table: { category: 'Accessibility' },
      },
      clearButtonLabel: {
        name: 'Clear Button Label',
        control: 'text',
        table: { category: 'Accessibility' },
      },
      noBorder: {
        name: 'No Border',
        control: 'boolean',
        table: { category: 'Styling (Deprecated)' },
      },
    },
    render: template,
  });
</script>

{#snippet template(
  args: ComponentProps<typeof Input>,
  context: StoryContext<ComponentProps<typeof Input>>,
)}
  <Input {...args} id={context.id} data-testid={context.id} />
{/snippet}

<Story name="Empty" parameters={redesignVisualParameters} />

<Story name="Disabled" args={{ disabled: true }} />

<Story name="Required" args={{ required: true }} />

<Story
  name="Error"
  args={{ error: true, hintText: 'Enter a valid workflow identifier.' }}
/>

<Story name="Invalid" args={{ valid: false }} />

<Story name="With Icon" args={{ icon: 'search' }} />

<Story name="With Suffix" args={{ suffix: 'suffix' }} />

<Story name="With Prefix" args={{ prefix: 'prefix' }} />

<Story name="With Hint Text" args={{ hintText: 'Hint Text' }} />

<Story
  name="Long Label"
  args={{
    label: 'Workflow identifier used to reconcile delayed customer orders',
    value: 'customer-order-reconciliation-2026-08-15',
  }}
/>

<Story
  name="Interaction States"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const keyboardInput = canvas.getByLabelText('Keyboard focus');
    const hoverInput = canvas.getByLabelText('Pointer hover');

    await userEvent.tab();
    expect(keyboardInput).toHaveFocus();
    await userEvent.hover(hoverInput);
  }}
>
  {#snippet template(args, context)}
    <div class="grid max-w-xl gap-3">
      <Input
        {...args}
        id={`${context.id}-keyboard`}
        label="Keyboard focus"
        placeholder="Type a workflow identifier"
      />
      <Input
        {...args}
        id={`${context.id}-hover`}
        label="Pointer hover"
        placeholder="Hover this field"
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Max Length"
  args={{ maxLength: 10 }}
  play={async ({ canvasElement, id }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId(id);
    await userEvent.type(input, '1234567890');
  }}
/>

<Story
  name="Less Than Max Length"
  args={{ maxLength: 10 }}
  play={async ({ canvasElement, id }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId(id);
    await userEvent.type(input, '123456789');
  }}
/>

<Story
  name="Exceeds Max Length"
  args={{ maxLength: 5 }}
  play={async ({ canvasElement, id }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId(id);
    await userEvent.type(input, '1234567890');
    expect(input).toHaveValue('12345');
  }}
/>

<Story
  name="Copyable"
  args={{ copyable: true, value: 'Copy Me' }}
  play={async ({ canvasElement }) => {
    userEvent.setup();
    const canvas = within(canvasElement);
    canvas.getByLabelText('Copy contents');
  }}
/>

<Story name="With Buttons">
  {#snippet template(args, context)}
    <Input {...args} id={context.id} data-testid={context.id}>
      {#snippet beforeInput()}
        <Button type="button">Before</Button>
      {/snippet}
      {#snippet afterInput()}
        <Button type="button">After</Button>
      {/snippet}
    </Input>
  {/snippet}
</Story>

<Story name="Forced Colors" parameters={redesignForcedColorsParameters}>
  {#snippet template(args, context)}
    <div class="grid max-w-xl gap-3">
      <Input
        {...args}
        id={`${context.id}-default`}
        label="Workflow identifier"
        value="customer-order-reconciliation"
      />
      <Input
        {...args}
        id={`${context.id}-error`}
        label="Invalid workflow identifier"
        error={true}
        hintText="Enter a valid workflow identifier."
      />
      <Input
        {...args}
        id={`${context.id}-disabled`}
        label="Unavailable workflow identifier"
        disabled={true}
        value="archived-workflow"
      />
    </div>
  {/snippet}
</Story>

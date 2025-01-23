<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
    type StoryContext,
  } from '@storybook/addon-svelte-csf';
  import { expect, userEvent, within } from '@storybook/test';

  import { iconNames } from '$lib/holocene/icon';

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
  });
</script>

<script lang="ts">
  import Button from '../button.svelte';

  setTemplate(template);
</script>

{#snippet template(
  { value, label, ...args }: Args<typeof Story>,
  context: StoryContext<typeof Story>,
)}
  <Input {value} {label} {...args} id={context.id} data-testid={context.id} />
{/snippet}

<Story name="Empty" />

<Story name="Disabled" args={{ disabled: true }} />

<Story name="Required" args={{ required: true }} />

<Story name="Error" args={{ error: true }} />

<Story name="Invalid" args={{ valid: false }} />

<Story name="With Icon" args={{ icon: 'search' }} />

<Story name="With Suffix" args={{ suffix: 'suffix' }} />

<Story name="With Hint Text" args={{ hintText: 'Hint Text' }} />

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
  {#snippet children({ value, label, ...args }, context)}
    <Input {value} {label} {...args} id={context.id} data-testid={context.id}>
      {#snippet before_input()}
        <Button type="button">Before</Button>
      {/snippet}
      {#snippet after_input()}
        <Button type="button">After</Button>
      {/snippet}
    </Input>
  {/snippet}
</Story>

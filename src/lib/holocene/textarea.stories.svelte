<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
  } from '@storybook/addon-svelte-csf';

  import Textarea from './textarea.svelte';

  const { Story } = defineMeta({
    title: 'Textarea',
    component: Textarea,
    args: {
      label: 'Label',
      description: 'Description',
      value: '',
      placeholder: 'Placeholder',
      error: '',
      required: false,
      disabled: false,
      isValid: true,
      rows: 5,
      spellcheck: false,
      maxLength: undefined,
      labelHidden: false,
    },
    argTypes: {
      label: { name: 'Label', control: 'text' },
      description: { name: 'Description', control: 'text' },
      value: { name: 'Value', control: 'text' },
      placeholder: { name: 'Placeholder', control: 'text' },
      error: { name: 'Error', control: 'text' },
      required: { name: 'Required', control: 'boolean' },
      disabled: { name: 'Disabled', control: 'boolean' },
      isValid: { name: 'Valid?', control: 'boolean' },
      rows: { name: 'Rows', control: 'range', min: 1, max: 10, step: 1 },
      spellcheck: { name: 'Spellcheck', control: 'boolean' },
      maxLength: { name: 'Maximum Length', control: 'number' },
      labelHidden: { name: 'Label Hidden', control: 'boolean' },
      id: { name: 'Id', control: 'text', table: { disable: true } },
    },
  });
</script>

<script lang="ts">
  import { action } from '@storybook/addon-actions';

  import { shouldNotBeTransparent } from './test-utilities';

  setTemplate(template);
</script>

{#snippet template({ id, label, value, ...args }: Args<typeof Story>)}
  <Textarea
    oninput={action('input')}
    onblur={action('blue')}
    onchange={action('change')}
    onfocus={action('focus')}
    onkeydown={action('keydown')}
    {id}
    {label}
    {value}
    {...args}
  />
{/snippet}

<Story
  name="Default"
  play={shouldNotBeTransparent((canvas) => canvas.getByRole('textbox'))}
/>

<Story name="Disabled" args={{ disabled: true }} />

<Story name="Error" args={{ error: 'An error message.', isValid: false }} />

<Story name="Required" args={{ required: true }} />

<Story name="Hidden Label" args={{ labelHidden: true }} />

<Story name="With Maximum Length" args={{ maxLength: 10 }} />

<Story name="With Value" args={{ value: 'Some text…' }} />

<Story name="With Rows" args={{ rows: 10 }} />

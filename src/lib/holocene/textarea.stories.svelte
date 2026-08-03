<svelte:options runes />

<script lang="ts" module>
  import { defineMeta, type StoryContext } from '@storybook/addon-svelte-csf';
  import { action } from 'storybook/actions';
  import { userEvent, within } from 'storybook/test';
  import type { ComponentProps } from 'svelte';

  import { shouldNotBeTransparent } from './test-utilities';

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
      maxLength: undefined as number | undefined,
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
    render: template,
  });
</script>

{#snippet template(
  args: ComponentProps<typeof Textarea>,
  context: StoryContext<ComponentProps<typeof Textarea>>,
)}
  <Textarea
    {...args}
    oninput={action('input')}
    onblur={action('blue')}
    onchange={action('change')}
    onfocus={action('focus')}
    onkeydown={action('keydown')}
    id={context.id}
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

<Story
  name="With Maximum Length"
  args={{ maxLength: 10 }}
  play={async ({ canvasElement, id }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId(id);
    await userEvent.click(input);
  }}
/>

<Story name="With Value" args={{ value: 'Some text…' }} />

<Story name="With Rows" args={{ rows: 10 }} />

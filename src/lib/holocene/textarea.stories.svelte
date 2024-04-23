<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import Textarea from './textarea.svelte';

  export const meta = {
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
  } satisfies Meta<Textarea>;
</script>

<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
  <Textarea
    on:input={action('input')}
    on:blur={action('blue')}
    on:change={action('change')}
    on:focus={action('focus')}
    on:keydown={action('keydown')}
    {...args}
  />
</Template>

<Story name="Default" />

<Story name="Disabled" args={{ disabled: true }} />

<Story name="Error" args={{ error: 'An error message.', isValid: false }} />

<Story name="Required" args={{ required: true }} />

<Story name="Hidden Label" args={{ labelHidden: true }} />

<Story name="Spellcheck" args={{ spellcheck: true }} />

<Story name="With Maximum Length" args={{ maxLength: 10 }} />

<Story name="With Value" args={{ value: 'Some text…' }} />

<Story name="With Rows" args={{ rows: 10 }} />

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
  name="Error (Dark)"
  args={{ error: 'An error message.', isValid: false }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Required (Dark)"
  args={{ required: true }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Hidden Label (Dark)"
  args={{ labelHidden: true }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Spellcheck (Dark)"
  args={{ spellcheck: true }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="With Maximum Length (Dark)"
  args={{ maxLength: 10 }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="With Value (Dark)"
  args={{ value: 'Some text…' }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="With Rows (Dark)"
  args={{ rows: 10 }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

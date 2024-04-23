<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import Checkbox from '$lib/holocene/checkbox.svelte';

  export const meta = {
    title: 'Checkbox',
    component: Checkbox,
    args: {
      label: 'Check Me',
      hoverable: true,
      disabled: false,
      checked: false,
      labelHidden: false,
      indeterminate: false,
      required: false,
      error: '',
      valid: true,
    },
    argTypes: {
      label: { control: 'text' },
      hoverable: { control: 'boolean' },
      disabled: { control: 'boolean' },
      checked: { control: 'boolean' },
      class: { table: { disable: true } },
      id: { table: { disable: true } },
      labelHidden: { control: 'boolean' },
      indeterminate: { control: 'boolean' },
      value: { control: 'text', table: { disable: true } },
      group: { control: 'object', table: { disable: true } },
      valid: { control: 'boolean' },
    },
  } satisfies Meta<Checkbox<string>>;
</script>

<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
  <Checkbox
    {...args}
    on:change={action('change')}
    on:click={action('click')}
    on:keypress={action('keypress')}
  />
</Template>

<Story name="Default" />

<Story name="Disabled" args={{ disabled: true }} />

<Story name="Checked" args={{ checked: true }} />

<Story name="Hidden Label" args={{ labelHidden: true }} />

<Story name="Indeterminate" args={{ indeterminate: true }} />

<Story name="Required" args={{ required: true }} />

<Story name="Error" args={{ error: 'Error' }} />

<Story name="Valid" args={{ valid: true }} />

<Story
  name="Default (Dark)"
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Disabled (Dark)"
  args={{ disabled: true }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Checked (Dark)"
  args={{ checked: true }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Hidden (Dark) Label"
  args={{ labelHidden: true }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Indeterminate (Dark)"
  args={{ indeterminate: true }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Required (Dark)"
  args={{ required: true }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Error (Dark)"
  args={{ error: 'Error' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Valid (Dark)"
  args={{ valid: true }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

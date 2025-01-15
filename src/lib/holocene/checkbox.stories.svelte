<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import Checkbox from '$lib/holocene/checkbox.svelte';

  export const meta = {
    title: 'Checkbox',
    component: Checkbox,
    args: {
      label: 'Check Me',
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
      disabled: { control: 'boolean' },
      checked: { control: 'boolean' },

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
    onchange={action('change')}
    onclick={action('click')}
    onkeypress={action('keypress')}
  />
</Template>

<Story name="Default" />

<Story name="Disabled" args={{ disabled: true }} />

<Story name="Checked" args={{ checked: true }} />

<Story name="Hidden Label" args={{ labelHidden: true }} />

<Story name="Indeterminate" args={{ indeterminate: true }} />

<Story name="Required" args={{ required: true }} />

<Story name="Invalid with Error" args={{ error: 'Error', valid: false }} />

<Story name="Valid" args={{ valid: true }} />

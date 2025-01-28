<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
  } from '@storybook/addon-svelte-csf';

  import Checkbox from '$lib/holocene/checkbox.svelte';

  const { Story } = defineMeta({
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
  });
</script>

<script lang="ts">
  import { action } from '@storybook/addon-actions';
  setTemplate(template);
</script>

{#snippet template(args: Args<typeof Story>)}
  <Checkbox
    {...args}
    onchange={action('change')}
    onclick={action('click')}
    onkeypress={action('keypress')}
  />
{/snippet}

<Story name="Default" />

<Story name="Disabled" args={{ disabled: true }} />

<Story name="Checked" args={{ checked: true }} />

<Story name="Hidden Label" args={{ labelHidden: true }} />

<Story name="Indeterminate" args={{ indeterminate: true }} />

<Story name="Required" args={{ required: true }} />

<Story name="Invalid with Error" args={{ error: 'Error', valid: false }} />

<Story name="Valid" args={{ valid: true }} />

<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { action } from 'storybook/actions';
  import { fn } from 'storybook/test';
  import type { ComponentProps } from 'svelte';

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
      onChange: fn(),
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
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof Checkbox>)}
  <div
    class="border border-io-border-primary bg-io-surface-primary p-4 text-io-content-primary"
  >
    <Checkbox
      {...args}
      onChange={action('change')}
      onclick={action('click')}
      onkeypress={action('keypress')}
    />
  </div>
{/snippet}

<Story name="Default" />

<Story name="Disabled" args={{ disabled: true }} />

<Story name="Checked" args={{ checked: true }} />

<Story name="Hidden Label" args={{ labelHidden: true }} />

<Story name="Indeterminate" args={{ indeterminate: true }} />

<Story name="Required" args={{ required: true }} />

<Story name="Invalid with Error" args={{ error: 'Error', valid: false }} />

<Story name="Valid" args={{ valid: true }} />

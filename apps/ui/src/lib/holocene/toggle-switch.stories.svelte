<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';

  export const meta = {
    title: 'Toggle Switch',
    component: ToggleSwitch,
    args: {
      label: 'Toggle Switch',
      labelPosition: 'right',
      labelHidden: false,
      disabled: false,
      checked: false,
    },
    argTypes: {
      label: { name: 'Label', control: 'text' },
      labelPosition: {
        name: 'Position',
        control: 'radio',
        options: ['left', 'right'],
      },
      labelHidden: { name: 'Label Hidden', control: 'boolean' },
      disabled: { name: 'Disabled', control: 'boolean' },
      checked: {
        name: 'Checked',
        control: 'boolean',
        table: { disable: true },
      },
    },
  } satisfies Meta<ToggleSwitch>;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args let:context>
  <ToggleSwitch {...args} id={context.id} />
</Template>

<Story name="Unchecked" />

<Story name="Checked" args={{ checked: true }} />

<Story name="Disabled" args={{ disabled: true }} />

<Story name="Label Hidden" args={{ labelHidden: true }} />

<Story name="Label Left" args={{ labelPosition: 'left' }} />

<Story name="Unchecked" />

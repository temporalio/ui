<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import { iconNames } from '$lib/holocene/icon';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import SplitButton from '$lib/holocene/split-button.svelte';

  export const meta = {
    title: 'Split Button',
    component: SplitButton,
    args: {
      label: 'Split Button',
      menuLabel: 'Actions',
      position: 'left',
      icon: undefined,
      disabled: false,
      primaryActionDisabled: false,
      href: 'https://caniuse.com',
    },
    argTypes: {
      position: {
        name: 'Position',
        control: 'radio',
        options: ['left', 'right'],
      },
      label: { name: 'Label', control: 'text' },
      menuLabel: {
        name: 'Menu Label',
        control: 'text',
        table: {
          category: 'Accessibility',
        },
      },

      icon: { name: 'Icon', control: 'select', options: iconNames },
      disabled: { name: 'Disabled', control: 'boolean' },
      primaryActionDisabled: {
        name: 'Primary Action Disabled',
        control: 'boolean',
      },
    },
  } satisfies Meta<SplitButton>;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
  <div class="flex">
    <SplitButton {...args}>
      <MenuItem>View</MenuItem>
      <MenuItem destructive>Delete</MenuItem>
    </SplitButton>
  </div>
</Template>

<Story name="Default" />

<Story name="With Icon" args={{ icon: 'trash' }} />

<Story name="Disabled" args={{ disabled: true }} />

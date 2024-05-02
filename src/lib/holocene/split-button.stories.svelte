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
  <SplitButton {...args}>
    <MenuItem>View</MenuItem>
    <MenuItem destructive>Delete</MenuItem>
  </SplitButton>
</Template>

<Story name="Default" />

<Story name="With Icon" args={{ icon: 'trash' }} />

<Story name="With Long Title" let:args>
  <div class="max-w-16">
    <SplitButton {...args} label="Request Cancellation">
      <MenuItem>View</MenuItem>
      <MenuItem destructive>Delete</MenuItem>
    </SplitButton>
  </div>
</Story>

<Story
  name="With Right-Positioned Icon"
  args={{
    icon: 'trash',
    position: 'right',
  }}
/>

<Story name="Primary, Disabled" args={{ disabled: true }} />

<Story name="Disabled with Icon" args={{ icon: 'trash', disabled: true }} />

<Story
  name="Primary (Dark)"
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Primary with Icon (Dark)"
  args={{ icon: 'trash' }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

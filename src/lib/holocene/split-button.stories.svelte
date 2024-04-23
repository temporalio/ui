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
      variant: 'primary',
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
      variant: {
        name: 'Variant',
        control: 'select',
        options: ['Primary', 'Secondary', 'Destructive', 'Ghost'],
        mapping: {
          primary: 'Primary',
          secondary: 'Secondary',
          destructive: 'Destructive',
          ghost: 'Ghost',
        },
      },
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

<Story name="Primary" />

<Story name="Primary Icon" args={{ icon: 'trash' }} />

<Story
  name="Primary with Right-Positioned Icon"
  args={{
    icon: 'trash',
    position: 'right',
  }}
/>

<Story name="Primary, Disabled" args={{ disabled: true }} />

<Story
  name="Primary, Disabled with Icon"
  args={{ icon: 'trash', disabled: true }}
/>

<Story name="Secondary" args={{ variant: 'Secondary' }} />

<Story
  name="Secondary with Icon"
  args={{ variant: 'Secondary', icon: 'trash' }}
/>

<Story
  name="Secondary with Right-Positioned Icon"
  args={{
    variant: 'Secondary',
    icon: 'trash',
    position: 'right',
  }}
/>

<Story
  name="Secondary, Disabled"
  args={{ variant: 'Secondary', disabled: true }}
/>

<Story
  name="Secondary, Disabled with Icon"
  args={{ icon: 'trash', variant: 'Secondary', disabled: true }}
/>

<Story name="Destructive" args={{ variant: 'Destructive' }} />

<Story
  name="Destructive with Icon"
  args={{ variant: 'Destructive', icon: 'trash' }}
/>

<Story
  name="Destructive with Right-Positioned Icon"
  args={{
    variant: 'Destructive',
    icon: 'trash',
    position: 'right',
  }}
/>

<Story
  name="Destructive, Disabled"
  args={{ variant: 'Destructive', disabled: true }}
/>

<Story
  name="Destructive, Disabled with Icon"
  args={{ icon: 'trash', variant: 'Destructive', disabled: true }}
/>

<Story name="Ghost" args={{ variant: 'Ghost' }} />

<Story name="Ghost with Icon" args={{ variant: 'Ghost', icon: 'trash' }} />

<Story
  name="Ghost with Right-Positioned Icon"
  args={{
    variant: 'Ghost',
    icon: 'trash',
    position: 'right',
  }}
/>

<Story name="Ghost, Disabled" args={{ variant: 'Ghost', disabled: true }} />

<Story
  name="Ghost, Disabled with Icon"
  args={{ icon: 'trash', variant: 'Ghost', disabled: true }}
/>

<Story
  name="Primary (Dark)"
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Primary with Icon (Dark)"
  args={{ icon: 'trash' }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Primary with Right-Positioned Icon (Dark)"
  args={{
    icon: 'trash',
    position: 'right',
  }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Primary, Disabled (Dark)"
  args={{ disabled: true }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Primary, Disabled with Icon (Dark)"
  args={{ icon: 'trash', disabled: true }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Secondary (Dark)"
  args={{ variant: 'Secondary' }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Secondary with Icon (Dark)"
  args={{ variant: 'Secondary', icon: 'trash' }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Secondary with Right-Positioned Icon (Dark)"
  args={{
    variant: 'Secondary',
    icon: 'trash',
    position: 'right',
  }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Secondary, Disabled (Dark)"
  args={{ variant: 'Secondary', disabled: true }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Secondary, Disabled with Icon (Dark)"
  args={{ icon: 'trash', variant: 'Secondary', disabled: true }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Destructive (Dark)"
  args={{ variant: 'Destructive' }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Destructive with Icon (Dark)"
  args={{ variant: 'Destructive', icon: 'trash' }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Destructive with Right-Positioned Icon (Dark)"
  args={{
    variant: 'Destructive',
    icon: 'trash',
    position: 'right',
  }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Destructive, Disabled (Dark)"
  args={{ variant: 'Destructive', disabled: true }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Destructive, Disabled with Icon (Dark)"
  args={{ icon: 'trash', variant: 'Destructive', disabled: true }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Ghost (Dark)"
  args={{ variant: 'Ghost' }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Ghost with Icon (Dark)"
  args={{ variant: 'Ghost', icon: 'trash' }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Ghost with Right-Positioned Icon (Dark)"
  args={{
    variant: 'Ghost',
    icon: 'trash',
    position: 'right',
  }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Ghost, Disabled (Dark)"
  args={{ variant: 'Ghost', disabled: true }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Ghost, Disabled with Icon (Dark)"
  args={{ icon: 'trash', variant: 'Ghost', disabled: true }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

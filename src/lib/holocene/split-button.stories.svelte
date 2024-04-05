<script lang="ts">
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

  import iconNames from '$lib/holocene/icon/icon-names';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import SplitButton from '$lib/holocene/split-button.svelte';
</script>

<Meta
  title="Split Button"
  component={SplitButton}
  argTypes={{
    position: { control: 'radio', options: ['left', 'right'] },
    label: { control: 'text' },
    menuLabel: { control: 'text' },
    id: { control: 'text' },
    icon: { control: 'select', options: iconNames },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'destructive', 'ghost'],
    },
  }}
/>

<Template let:args>
  <SplitButton {...args}>
    <MenuItem>View</MenuItem>
    <MenuItem destructive>Delete</MenuItem>
  </SplitButton>
</Template>

<Story
  args={{
    label: 'Edit',
    menuLabel: 'Actions',
    id: 'button-1',
    variant: 'primary',
    position: 'left',
  }}
  name="split button"
/>

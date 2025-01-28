<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
  } from '@storybook/addon-svelte-csf';

  import { iconNames } from '$lib/holocene/icon';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import SplitButton from '$lib/holocene/split-button.svelte';

  const { Story } = defineMeta({
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
  });
</script>

<script lang="ts">
  setTemplate(template);
</script>

{#snippet template({ id, label, menuLabel, ...args }: Args<typeof Story>)}
  <div class="flex">
    <SplitButton {id} {label} {menuLabel} {...args}>
      <MenuItem>View</MenuItem>
      <MenuItem destructive>Delete</MenuItem>
    </SplitButton>
  </div>
{/snippet}

<Story name="Default" />

<Story name="With Icon" args={{ icon: 'trash' }} />

<Story name="Disabled" args={{ disabled: true }} />

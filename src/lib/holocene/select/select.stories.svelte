<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import { iconNames } from '$lib/holocene/icon';

  import Option from './option.svelte';
  import Select from './select.svelte';

  export const meta = {
    title: 'Select',
    component: Select,
    args: {
      id: 'select',
      label: 'Select',
      placeholder: 'Select an option',
      leadingIcon: undefined,
      labelHidden: false,
      disabled: false,
      unroundLeft: false,
      unroundRight: false,
    },
    argTypes: {
      label: { name: 'Label', control: 'text' },
      placeholder: { name: 'Placeholder', control: 'text' },
      leadingIcon: {
        name: 'Icon',
        control: { type: 'select', options: iconNames },
      },
      disabled: { name: 'Disabled', control: 'boolean' },
      labelHidden: { name: 'Label Hidden', control: 'boolean' },
      unroundLeft: {
        name: 'Left',
        control: 'boolean',
        table: { category: 'Styling', subcategory: 'Unround' },
      },
      unroundRight: {
        name: 'Right',
        control: 'boolean',
        table: { category: 'Styling', subcategory: 'Unround' },
      },
      onChange: { table: { disable: true } },
      id: { table: { disable: true } },
      value: { table: { disable: true } },
      SELECT_CONTEXT: { table: { disable: true } },
    },
  } satisfies Meta;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args let:context>
  <Select {...args} id={context.id}>
    <Option value="pizza">Pizza</Option>
    <Option value="hamburgers">Hamburgers</Option>
    <Option value="hot_dogs">Hot Dogs</Option>
  </Select>
</Template>

<Story name="Unselected" />

<Story name="With Icon" args={{ leadingIcon: 'regions' }} />

<Story name="Selected" args={{ value: 'pizza' }} />

<Story name="Disabled" args={{ disabled: true }} />

<Story
  name="Disabled with Icon"
  args={{ disabled: true, leadingIcon: 'regions' }}
/>

<Story name="Disabled and Selected" args={{ disabled: true, value: 'pizza' }} />

<Story name="Label Hidden" args={{ labelHidden: true }} />

<Story
  name="Unselected (Dark)"
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="With Icon (Dark)"
  args={{ leadingIcon: 'regions' }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Selected (Dark)"
  args={{ value: 'pizza' }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Disabled (Dark)"
  args={{ disabled: true }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Disabled with Icon (Dark)"
  args={{ disabled: true, leadingIcon: 'regions' }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Disabled and Selected (Dark)"
  args={{ disabled: true, value: 'pizza' }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Label Hidden (Dark)"
  args={{ labelHidden: true }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

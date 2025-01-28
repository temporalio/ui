<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
    type StoryContext,
  } from '@storybook/addon-svelte-csf';

  import { iconNames } from '$lib/holocene/icon';

  import Option from './option.svelte';
  import Select from './select.svelte';

  const { Story } = defineMeta({
    title: 'Select',
    component: Select,
    args: {
      id: 'select',
      label: 'Select',
      placeholder: 'Select an option',
      leadingIcon: undefined,
      labelHidden: false,
      disabled: false,
    },
    argTypes: {
      label: { name: 'Label', control: 'text' },
      placeholder: { name: 'Placeholder', control: 'text' },
      leadingIcon: {
        name: 'Icon',
        control: 'select',
        options: iconNames,
      },
      disabled: { name: 'Disabled', control: 'boolean' },
      labelHidden: { name: 'Label Hidden', control: 'boolean' },
      onChange: { table: { disable: true } },
      value: { table: { disable: true } },
    },
  });
</script>

<script lang="ts">
  setTemplate(template);
</script>

{#snippet template(
  { label, ...args }: Args<typeof Story>,
  context: StoryContext<typeof Story>,
)}
  <Select {label} {...args} id={context.id}>
    <Option value="pizza">Pizza</Option>
    <Option value="hamburgers">Hamburgers</Option>
    <Option value="hot_dogs">Hot Dogs</Option>
  </Select>
{/snippet}

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

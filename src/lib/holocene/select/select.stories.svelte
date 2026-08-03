<svelte:options runes />

<script lang="ts" module>
  import { defineMeta, type StoryContext } from '@storybook/addon-svelte-csf';
  import { fn } from 'storybook/test';
  import type { ComponentProps } from 'svelte';

  import type { IconName } from '$lib/holocene/icon';
  import { iconNames } from '$lib/holocene/icon';

  import Option from './option.svelte';
  import Select from './select.svelte';

  const { Story } = defineMeta({
    title: 'Select',
    component: Select,
    render: template,
    args: {
      id: 'select',
      label: 'Select',
      placeholder: 'Select an option',
      leadingIcon: undefined as IconName | undefined,
      labelHidden: false,
      disabled: false,
      onChange: fn(),
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
      position: {
        name: 'Position',
        control: 'inline-radio',
        options: ['left', 'right'],
      },
    },
  });
</script>

{#snippet template(
  args: ComponentProps<typeof Select>,
  context: StoryContext<ComponentProps<typeof Select>>,
)}
  <Select {...args} id={context.id}>
    <Option value="pizza">Pizza</Option>
    <Option value="hamburgers">Hamburgers</Option>
    <Option value="hot_dogs">Hot Dogs</Option>
  </Select>
{/snippet}

<Story name="Unselected" />

<Story name="With Icon" args={{ leadingIcon: 'regions' }} />

<Story name="Selected" args={{ value: 'pizza' }} />

<Story name="Disabled" args={{ disabled: true }} />

<Story name="Loading" args={{ loading: true }} />

<Story
  name="Disabled with Icon"
  args={{ disabled: true, leadingIcon: 'regions' }}
/>

<Story name="Disabled and Selected" args={{ disabled: true, value: 'pizza' }} />

<Story name="Label Hidden" args={{ labelHidden: true }} />

<Story
  name="Invalid with error message"
  args={{ valid: false, error: 'This value is invalid' }}
/>

<Story name="Right" args={{ position: 'right' }} />

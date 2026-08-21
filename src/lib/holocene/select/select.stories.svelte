<script lang="ts" module>
  import { defineMeta, type StoryContext } from '@storybook/addon-svelte-csf';
  import { fn } from 'storybook/test';
  import type { ComponentProps } from 'svelte';

  import * as ioIcons from '$lib/io/icon';

  const iconOptions: Record<string, unknown> = { ...ioIcons };

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
      labelHidden: false,
      disabled: false,
      onChange: fn(),
    },
    argTypes: {
      label: { name: 'Label', control: 'text' },
      placeholder: { name: 'Placeholder', control: 'text' },
      LeadingIcon: {
        name: 'Leading Icon',
        control: 'select',
        options: Object.keys(iconOptions),
        mapping: iconOptions,
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

<Story name="With Icon" args={{ LeadingIcon: ioIcons.IconRegions }} />

<Story name="Selected" args={{ value: 'pizza' }} />

<Story name="Disabled" args={{ disabled: true }} />

<Story name="Loading" args={{ loading: true }} />

<Story
  name="Disabled with Icon"
  args={{ disabled: true, LeadingIcon: ioIcons.IconRegions }}
/>

<Story name="Disabled and Selected" args={{ disabled: true, value: 'pizza' }} />

<Story name="Label Hidden" args={{ labelHidden: true }} />

<Story
  name="Invalid with error message"
  args={{ valid: false, error: 'This value is invalid' }}
/>

<Story name="Right" args={{ position: 'right' }} />

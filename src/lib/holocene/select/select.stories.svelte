<script lang="ts">
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

  import iconNames from '$lib/holocene/icon/icon-names';

  import Option from './option.svelte';
  import Select from './select.svelte';

  let value: string;
</script>

<Meta
  title="Select"
  component={Select}
  argTypes={{
    id: { control: 'text' },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    leadingIcon: { control: 'select', options: iconNames },
  }}
/>

<Template let:args>
  <Select bind:value {...args}>
    <Option value="pizza">Pizza</Option>
    <Option value="hamburgers">Hamburgers</Option>
    <Option value="hot_dogs">Hot Dogs</Option>
  </Select>
</Template>

<Story
  name="select"
  args={{
    id: 'select-1',
    label: 'Favorite Food',
    placeholder: 'Select your favorite food...',
    leadingIcon: 'temporal-logo',
  }}
/>

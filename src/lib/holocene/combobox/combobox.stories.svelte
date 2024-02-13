<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

  import Combobox from '$lib/holocene/combobox/combobox.svelte';
  import iconNames from '$lib/holocene/icon/icon-names';

  let stringOptions = [
    'English',
    'English (UK)',
    'German',
    'French',
    'Japanese',
  ];

  let customOptions = [
    { label: 'English', value: 'en-us' },
    { label: 'English (UK)', value: 'en-uk' },
    { label: 'German', value: 'de' },
    { label: 'French', value: 'fr' },
    { label: 'Japanese', value: 'jp' },
  ];
</script>

<Meta
  title="Combobox"
  component={Combobox}
  args={{
    label: 'Select a Language',
    placeholder: 'Start Typing...',
    noResultsText: 'No Results',
    toggleLabel: 'Show Results',
    readonly: false,
    required: false,
    disabled: false,
    leadingIcon: 'search',
  }}
  argTypes={{
    leadingIcon: { control: 'select', options: iconNames },
    options: { control: false },
    id: { control: 'text' },
    value: { control: 'text' },
    toggleLabel: { control: 'text' },
    noResultsText: { control: 'text' },
    placeholder: { control: 'text' },
    label: { control: 'text' },
    optionValueKey: { control: 'text' },
    optionLabelKey: { control: 'text' },
    theme: { control: 'select', options: ['light', 'dark'] },
    filterable: { control: 'boolean' },
  }}
/>

<Template let:args>
  <Combobox
    on:change={action('change')}
    on:filter={action('filter')}
    {...args}
  />
</Template>

<Story
  name="with string options"
  args={{ id: 'combobox-1', options: stringOptions }}
/>
<Story
  name="with custom options"
  args={{
    id: 'combobox-2',
    options: customOptions,
    optionLabelKey: 'label',
    optionValueKey: 'value',
  }}
/>

<!-- <Hst.Story title="combobox">
  <Hst.Variant title="a combobox with string options (uncontrolled)">
    <Combobox
      bind:value
      {leadingIcon}
      label="Select a Language"
      placeholder="Type a Language..."
      noResultsText="No Results"
      toggleLabel="Show Results"
      id="combobox-1"
      options={stringOptions}
    />
  </Hst.Variant>

  <Hst.Variant title="a combobox with custom options (uncontrolled)">
    <Combobox
      bind:value={customValue}
      {leadingIcon}
      label="Select a Language"
      noResultsText="No Results"
      toggleLabel="Show Results"
      id="combobox-2"
      options={customOptions}
      optionLabelKey="label"
      optionValueKey="value"
    />
  </Hst.Variant>

  <svelte:fragment slot="controls">
    <Hst.Select
      bind:value={leadingIcon}
      title="Leading Icon"
      options={[{ label: 'None', value: '' }, ...Object.keys(icons)]}
    />
  </svelte:fragment>
</Hst.Story> -->

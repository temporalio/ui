<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  import Combobox from '$lib/holocene/combobox/combobox.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import ComboboxOption from '$lib/holocene/combobox/combobox-option.svelte';
  export let Hst: HST;

  let stringOptions = [
    'English',
    'English (UK)',
    'German',
    'French',
    'Japanese',
  ];

  type CustomOption = {
    label: string;
    value: string;
    flag: string;
    disabled?: boolean;
  };

  let customOptions: CustomOption[] = [
    { label: 'English', value: 'en-us', flag: '🇺🇸' },
    { label: 'English (UK)', value: 'en-uk', flag: '🇬🇧' },
    { label: 'German', value: 'de', flag: '🇩🇪', disabled: true },
    { label: 'French', value: 'fr', flag: '🇫🇷' },
    { label: 'Japanese', value: 'jp', flag: '🇯🇵' },
  ];

  let value = stringOptions[0];
  let customValue = customOptions[1].value;

  const handleSelect = (option: CustomOption) => {
    customValue = option.value;
  };

  const match = (option: CustomOption, value: string) => {
    return option.value === value;
  };

  const filter = (option: CustomOption, value: string) => {
    return (
      option.label.toLowerCase().includes(value.toLowerCase()) ||
      option.value.toLowerCase().includes(value.toLowerCase())
    );
  };

  const renderDisplayValue = (option: CustomOption) => {
    return option.label;
  };
</script>

<Hst.Story title="combobox">
  <Hst.Variant title="a combobox with string options (uncontrolled)">
    <Combobox
      bind:value
      label="Select a Language"
      placeholder="Type a Language..."
      noResultsText="No Results"
      id="combobox-1"
      options={stringOptions}
    />
  </Hst.Variant>

  <Hst.Variant title="a combobox with custom options (uncontrolled)">
    <Combobox
      bind:value={customValue}
      label="Select a Language"
      noResultsText="No Results"
      id="combobox-2"
      options={customOptions}
      optionLabelKey="label"
      optionValueKey="value"
    />
  </Hst.Variant>

  <Hst.Variant title="a combobox with custom options (controlled)">
    <Combobox
      value={customValue}
      label="Select a Language"
      noResultsText="No Results"
      id="combobox-3"
      leadingIcon="regions"
      options={customOptions}
      {renderDisplayValue}
      {filter}
      {match}
    >
      <svelte:fragment let:option>
        <ComboboxOption
          on:click={() => handleSelect(option)}
          selected={customValue === option.value}
          disabled={option.disabled}
        >
          <span slot="leading">
            {option.flag}
          </span>
          <span>
            {option.label}
          </span>
        </ComboboxOption>
      </svelte:fragment>
    </Combobox>
  </Hst.Variant>
</Hst.Story>

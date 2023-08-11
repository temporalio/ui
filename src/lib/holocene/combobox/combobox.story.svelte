<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  import Combobox from '$lib/holocene/combobox/combobox.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import ComboboxOption from '$lib/holocene/combobox/combobox-option.svelte';
  export let Hst: HST;

  let options = ['English', 'English (UK)', 'German', 'French', 'Japanese'];

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

  let customCombobox: Combobox<CustomOption>;
  let value: string;
  let customValue = customOptions[0].value;

  const handleSelect = (option: CustomOption) => {
    customValue = option.value;
    customCombobox.closeList();
  };
</script>

<Hst.Story title="combobox">
  <Hst.Variant title="a combobox with default options">
    <Combobox
      bind:value
      label="Select a Language"
      placeholder="Type a Language..."
      noResultsText="No Results"
      id="combobox-1"
      {options}
    />
  </Hst.Variant>

  <Hst.Variant title="a combobox with custom options">
    <Combobox
      bind:this={customCombobox}
      bind:value={customValue}
      label="Select a Language"
      noResultsText="No Results"
      id="combobox-2"
      options={customOptions}
      optionLabelKey="label"
      optionValueKey="value"
    >
      <Icon name="regions" slot="leading" />
      <svelte:fragment let:option>
        <ComboboxOption
          on:select={() => handleSelect(option)}
          selected={value === option.value}
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

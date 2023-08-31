<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  
  import Combobox from '$lib/holocene/combobox/combobox.svelte';
  import { type IconName, icons } from '$lib/holocene/icon/paths';
  export let Hst: HST;

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

  let value = stringOptions[0];
  let customValue = customOptions[0].value;
  let leadingIcon: IconName = 'search';
</script>

<Hst.Story title="combobox">
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
    <Hst.Select bind:value={leadingIcon} title="Leading Icon" options={[{ label: 'None', value: '' }, ...Object.keys(icons)]} />
  </svelte:fragment>
</Hst.Story>

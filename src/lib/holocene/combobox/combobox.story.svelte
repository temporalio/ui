<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  
  import Combobox from '$lib/holocene/combobox/combobox.svelte';
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
</Hst.Story>

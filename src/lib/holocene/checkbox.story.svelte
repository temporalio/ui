<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import type { Hst as HST } from '@histoire/plugin-svelte';

  export let Hst: HST;
  let checked = true;
</script>

<Hst.Story>
  <Hst.Variant title="A Checkbox">
    <Checkbox id="checkbox-input" label="Select All" bind:checked />
  </Hst.Variant>

  <Hst.Variant title="An indeterminate Checkbox Input">
    <Checkbox
      id="checkbox-input"
      label="Select All"
      indeterminate
      bind:checked
    />
  </Hst.Variant>

  <Hst.Variant title="A disabled Checkbox Input">
    <Checkbox id="checkbox-input" label="Select All" bind:checked disabled />
  </Hst.Variant>

  <Hst.Variant title="A disabled indeterminate Checkbox Input">
    <Checkbox
      id="checkbox-input"
      label="Select All"
      indeterminate
      bind:checked
      disabled
    />
  </Hst.Variant>
</Hst.Story>

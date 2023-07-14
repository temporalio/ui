<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  
  import Autocomplete from './autocomplete.svelte';

  export let Hst: HST;
  let value = '';
</script>

<Hst.Story>
  <Hst.Variant title="An Autocomplete Input">
    <Autocomplete
      id="autocomplete"
      label="Example"
      {value}
      icon="search"
      type="search"
      options={['Avacado', 'Bacon', 'Cheese', 'Donuts', 'Eggs']}
      onOptionClick={(v) => (value = v)}
    />
  </Hst.Variant>
</Hst.Story>

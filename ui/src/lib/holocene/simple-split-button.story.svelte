<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  import SimpleSplitButton from './simple-split-button.svelte';

  export let Hst: HST;
</script>

<Hst.Story>
  <Hst.Variant title="A Split Button">
    <SimpleSplitButton id="button-1" label="Edit">
      <div>Relative</div>
      <div>UTC</div>
      <div>Local</div>
    </SimpleSplitButton>
  </Hst.Variant>
</Hst.Story>

<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import type { Hst as HST } from '@histoire/plugin-svelte';

  export let Hst: HST;
  let checked = true;
  let onDark = false;
  let indeterminate = false;
  let disabled = false;
  let label = '';
</script>

<Hst.Story>
  <Hst.Variant title="A Checkbox">
    <div class="h-20 w-20 py-5 px-4" class:bg-primary={onDark}>
      <Checkbox
        id="checkbox-input"
        bind:label
        bind:checked
        bind:onDark
        bind:indeterminate
        bind:disabled
      />
    </div>
  </Hst.Variant>

  <svelte:fragment slot="controls">
    <Hst.Checkbox bind:value={onDark} title="On Dark:" />
    <Hst.Checkbox bind:value={indeterminate} title="Indeterminate:" />
    <Hst.Checkbox bind:value={disabled} title="Disabled:" />
    <Hst.Text bind:value={label} title="Label:" />
  </svelte:fragment>
</Hst.Story>

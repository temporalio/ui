<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  import Textarea from './textarea.svelte';

  export let Hst: HST;

  let disabled = false;
  let isValid = true;
  let error = '';
  let value = '';
</script>

<Hst.Story>
  <Textarea {disabled} {isValid} {error} bind:value />

  <svelte:fragment slot="controls">
    <Hst.Checkbox title="Disabled: " bind:value={disabled} />
    <Hst.Checkbox title="Valid: " bind:value={isValid} />
    <Hst.Text title="Error: " bind:value={error} />
  </svelte:fragment>
</Hst.Story>

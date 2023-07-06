<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  
  import Textarea from './textarea.svelte';

  export let Hst: HST;

  let disabled = false;
  let isValid = true;
  let error = '';
  let value = '';
  let label = 'Label';
  let required = true;
</script>

<Hst.Story>
  <Textarea id="textarea" {disabled} {isValid} {error} bind:value />

  <svelte:fragment slot="controls">
    <Hst.Checkbox title="Disabled: " bind:value={disabled} />
    <Hst.Checkbox title="Valid: " bind:value={isValid} />
    <Hst.Text title="Error: " bind:value={error} />
  </svelte:fragment>
</Hst.Story>

<Hst.Story>
  <Textarea
    id="textarea-with-label"
    {disabled}
    {isValid}
    {error}
    {label}
    {required}
    bind:value
  />

  <svelte:fragment slot="controls">
    <Hst.Text title="Label: " bind:value={label} />
    <Hst.Checkbox title="Required: " bind:value={required} />
  </svelte:fragment>
</Hst.Story>

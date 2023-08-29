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
  let description = 'Description goes here.';
</script>

<Hst.Story title="textarea">
  <Textarea
    id="textarea-with-label"
    {disabled}
    {isValid}
    {error}
    {label}
    {required}
    {description}
    bind:value
  />

  <svelte:fragment slot="controls">
    <Hst.Checkbox title="Disabled: " bind:value={disabled} />
    <Hst.Checkbox title="Valid: " bind:value={isValid} />
    <Hst.Text title="Error: " bind:value={error} />
    <Hst.Text title="Label: " bind:value={label} />
    <Hst.Checkbox title="Required: " bind:value={required} />
  </svelte:fragment>
</Hst.Story>

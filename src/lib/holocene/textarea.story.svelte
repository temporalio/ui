<script lang="ts">
  import Textarea from './textarea.svelte';

  export let Hst;

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

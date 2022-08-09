<script lang="ts">
  import Chapter from '../_chapter.svelte';

  import CheckboxInput from '$lib/holocene/checkbox.svelte';
  let state = new Array(8).fill(false);
</script>

<Chapter description="A Checkbox Input">
  <CheckboxInput id="checkbox-input" label="Select All" checked={state[0]} />
</Chapter>

<Chapter description="An indeterminate Checkbox Input">
  <CheckboxInput
    id="checkbox-input"
    label="Select All"
    indeterminate
    checked={state[1]}
  />
</Chapter>

<Chapter description="A Checkbox Input on a dark background">
  <div class="w-fit bg-primary p-4">
    <CheckboxInput
      onDark
      id="checkbox-input"
      label="Select All"
      checked={state[2]}
    />
  </div>
</Chapter>

<Chapter
  description="An indeterminate Checkbox Input on a dark background without a label"
>
  <div class="w-fit bg-primary p-4">
    <CheckboxInput
      onDark
      id="checkbox-input"
      indeterminate
      checked={state[3]}
    />
  </div>
</Chapter>

<Chapter description="A disabled Checkbox Input">
  <CheckboxInput
    id="checkbox-input"
    label="Select All"
    checked={state[4]}
    disabled
  />
</Chapter>

<Chapter description="A disabled indeterminate Checkbox Input">
  <CheckboxInput
    id="checkbox-input"
    label="Select All"
    indeterminate
    checked={state[5]}
    disabled
  />
</Chapter>

<Chapter description="A disabled Checkbox Input on a dark background">
  <div class="w-fit bg-primary p-4">
    <CheckboxInput
      label="Select All"
      onDark
      id="checkbox-input"
      disabled
      checked={state[6]}
    />
  </div>
</Chapter>

<Chapter
  description="A disabled indeterminate Checkbox Input on a dark background"
>
  <div class="w-fit bg-primary p-4">
    <CheckboxInput
      label="Select All"
      onDark
      id="checkbox-input"
      indeterminate
      disabled
      checked={state[7]}
    />
  </div>
</Chapter>

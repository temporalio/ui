<script lang="ts">
  import Chapter from '../_chapter.svelte';

  import CheckboxInput from '$lib/holocene/checkbox.svelte';
</script>

<Chapter description="A Checkbox Input">
  <CheckboxInput id="checkbox-input" label="Select All" checked />
</Chapter>

<Chapter description="An indeterminate Checkbox Input">
  <CheckboxInput id="checkbox-input" label="Select All" indeterminate checked />
</Chapter>

<Chapter description="A Checkbox Input on a dark background">
  <div class="w-fit bg-primary p-4">
    <CheckboxInput onDark id="checkbox-input" label="Select All" checked />
  </div>
</Chapter>

<Chapter
  description="An indeterminate Checkbox Input on a dark background without a label"
>
  <div class="w-fit bg-primary p-4">
    <CheckboxInput onDark id="checkbox-input" indeterminate checked />
  </div>
</Chapter>

<Chapter description="A disabled Checkbox Input">
  <CheckboxInput id="checkbox-input" label="Select All" checked disabled />
</Chapter>

<Chapter description="A disabled indeterminate Checkbox Input">
  <CheckboxInput
    id="checkbox-input"
    label="Select All"
    indeterminate
    checked
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
      checked
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
      checked
    />
  </div>
</Chapter>

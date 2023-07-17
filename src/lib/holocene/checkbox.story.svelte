<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  import { logEvent } from 'histoire/client';
  
  import Checkbox from '$lib/holocene/checkbox.svelte';

  export let Hst: HST;
  let checked = true;
  let onDark = false;
  let indeterminate = false;
  let disabled = false;
  let label = 'The Label';
  let hoverable = false;
  let group = ['A'];

  const handleChange = (e: CustomEvent) => {
    logEvent('change', e.detail);
  };
</script>

<Hst.Story>
  <Hst.Variant title="A Checkbox">
    <div
      class="flex h-20 w-full items-center justify-center"
      class:bg-primary={onDark}
    >
      <Checkbox
        id="checkbox-input"
        bind:label
        bind:checked
        bind:onDark
        bind:indeterminate
        bind:disabled
        bind:hoverable
        on:change={handleChange}
      />
    </div>
    <p>Checked: {checked}</p>
  </Hst.Variant>

  <Hst.Variant title="A group of Checkboxes">
    <div class="flex flex-col gap-2">
      <Checkbox
        id="checkbox-group-1"
        label="Option A"
        value="A"
        on:change={handleChange}
        bind:group
      />
      <Checkbox
        id="checkbox-group-1"
        label="Option B"
        value="B"
        on:change={handleChange}
        bind:group
      />
      <Checkbox
        id="checkbox-group-1"
        label="Option C"
        value="C"
        on:change={handleChange}
        bind:group
      />
    </div>
    <pre class="mt-4">The Group: {JSON.stringify(group, undefined, 2)}</pre>
  </Hst.Variant>

  <svelte:fragment slot="controls">
    <Hst.Checkbox bind:value={onDark} title="On Dark:" />
    <Hst.Checkbox bind:value={indeterminate} title="Indeterminate:" />
    <Hst.Checkbox bind:value={disabled} title="Disabled:" />
    <Hst.Checkbox bind:value={hoverable} title="Hoverable:" />
    <Hst.Text bind:value={label} title="Label:" />
  </svelte:fragment>
</Hst.Story>

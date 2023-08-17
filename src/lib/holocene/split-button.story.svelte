<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';

  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import SplitButton from '$lib/holocene/split-button.svelte';

  export let Hst: HST;
  let disabled = false;
  let position: 'left' | 'right' = 'left';
</script>

<Hst.Story>
  <Hst.Variant title="A Split Button">
    <SplitButton
      {position}
      {disabled}
      id="button-1"
      label="Edit"
      menuLabel="Actions"
    >
      <MenuItem>Edit</MenuItem>
      <MenuItem destructive>Delete</MenuItem>
    </SplitButton>
  </Hst.Variant>

  <svelte:fragment slot="controls">
    <Hst.Checkbox bind:value={disabled} title="Disabled" />
    <Hst.Select
      bind:value={position}
      title="Position"
      options={['left', 'right']}
    />
  </svelte:fragment>
</Hst.Story>

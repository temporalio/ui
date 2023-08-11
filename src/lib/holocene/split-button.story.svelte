<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';

  import MenuItem from './primitives/menu/menu-item.svelte';
  import SplitButton from './split-button.svelte';

  export let Hst: HST;
</script>

<Hst.Story>
  <Hst.Variant title="A Split Button">
    <SplitButton id="button-1" label="Edit" menuLabel="Actions">
      <MenuItem>Edit</MenuItem>
      <MenuItem destructive>Delete</MenuItem>
    </SplitButton>
  </Hst.Variant>

  <Hst.Variant title="A disabled Split Button">
    <SplitButton id="button-2" label="Edit" menuLabel="Actions" disabled />
  </Hst.Variant>

  <Hst.Variant title="A right-aligned Split Button">
    <div class="flex flex-row justify-end">
      <SplitButton
        id="button-3"
        label="Edit"
        menuLabel="Actions"
        right
        href="/"
      >
        <MenuItem>Edit</MenuItem>
        <MenuItem destructive>Delete</MenuItem>
      </SplitButton>
    </div>
  </Hst.Variant>
</Hst.Story>

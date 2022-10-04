<script lang="ts">
  import DropdownMenu from '$lib/holocene/dropdown-menu.svelte';
  import Icon from '$holocene/icon/icon.svelte';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
  import type { Hst } from '@histoire/plugin-svelte';

  export let Hst: Hst;
</script>

<Hst.Story>
  <DropdownMenu id="dropdown-1">
    <Icon name="vertical-ellipsis" slot="trigger" />
    <svelte:fragment slot="items">
      <MenuItem href="https://temporal.io">Link</MenuItem>
      <MenuItem disabled href="https://temporal.io">Disabled Link</MenuItem>
      <MenuItem selected>Selected</MenuItem>
      <MenuItem>Standard</MenuItem>
      <MenuItem destructive>Destructive</MenuItem>
    </svelte:fragment>
  </DropdownMenu>
</Hst.Story>

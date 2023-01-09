<script lang="ts">
  import DropdownMenu from '$lib/holocene/dropdown-menu.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
  import type { Hst as HST } from '@histoire/plugin-svelte';

  export let Hst: HST;
</script>

<Hst.Story>
  <DropdownMenu id="dropdown-1">
    <Icon name="vertical-ellipsis" slot="trigger" />
    <div class="w-56" slot="items">
      <MenuItem href="https://temporal.io">Link</MenuItem>
      <MenuItem disabled href="https://temporal.io">Disabled Link</MenuItem>
      <MenuItem selected>Selected</MenuItem>
      <MenuItem>Standard</MenuItem>
      <MenuItem destructive>Destructive</MenuItem>
    </div>
  </DropdownMenu>
</Hst.Story>

<script lang="ts">
  import DropdownMenu from '$lib/holocene/dropdown-menu.svelte';
  import Chapter from '../_chapter.svelte';
  import Icon from '$lib/holocene/icon/index.svelte';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
</script>

<Chapter description="A Dropdown Menu">
  <DropdownMenu id="dropdown-1">
    <Icon name="verticalEllipsis" slot="trigger" />
    <svelte:fragment slot="items">
      <MenuItem href="https://temporal.io">Link</MenuItem>
      <MenuItem disabled href="https://temporal.io">Disabled Link</MenuItem>
      <MenuItem selected>Selected</MenuItem>
      <MenuItem>Standard</MenuItem>
      <MenuItem destructive>Destructive</MenuItem>
    </svelte:fragment>
  </DropdownMenu>
</Chapter>

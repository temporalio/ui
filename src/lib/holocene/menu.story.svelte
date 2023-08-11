<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  import { logEvent } from 'histoire/client';

  import {
    MenuContainer,
    MenuButton,
    Menu,
    MenuItem,
  } from '$lib/holocene/menu';
  import Icon from './icon/icon.svelte';

  export let Hst: HST;
</script>

<Hst.Story>
  <MenuContainer class="w-[400px]">
    <MenuButton hasIndicator controls="menu-1">
      <Icon slot="leading" name="temporal-logo" />
      Menu
    </MenuButton>
    <Menu id="menu-1">
      <MenuItem href="https://temporal.io">Link</MenuItem>
      <MenuItem disabled href="https://temporal.io">Disabled Link</MenuItem>
      <MenuItem on:click={(e) => logEvent('click', e)} selected
        >Selected</MenuItem
      >
      <MenuItem on:click={(e) => logEvent('click', e)}>Standard</MenuItem>
      <MenuItem on:click={(e) => logEvent('click', e)} destructive
        >Destructive</MenuItem
      >
    </Menu>
  </MenuContainer>
</Hst.Story>

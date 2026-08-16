<script lang="ts">
  import DarkModeMenu from '$lib/components/dark-mode-menu.svelte';
  import PaletteMenu from '$lib/components/palette-menu.svelte';
  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuItem,
  } from '$lib/holocene/menu';
  import { translate } from '$lib/i18n/translate';
  import { authUser } from '$lib/stores/auth-user';
  import ziggy from '$lib/vendor/ziggy-full-face.png';

  import Icon from './icon/icon.svelte';
  import MenuDivider from './menu/menu-divider.svelte';

  interface Props {
    logout: () => void;
  }

  let { logout }: Props = $props();

  let showProfilePic = $state(true);

  function fixImage() {
    showProfilePic = false;
  }
</script>

<MenuContainer>
  <MenuButton
    variant="ghost"
    hasIndicator
    data-testid="user-menu-trigger"
    controls="user-menu"
  >
    {#if $authUser.accessToken}
      <img
        src={$authUser?.picture}
        alt={$authUser?.profile ?? translate('common.user-profile')}
        class="h-6 w-6 cursor-pointer rounded-control object-cover"
        onerror={fixImage}
        class:hidden={!showProfilePic}
      />
      <div
        class="aspect-square h-6 w-6 rounded-control bg-information p-0.5"
        class:hidden={showProfilePic}
      >
        {#if $authUser?.name}
          <div class="text-center text-xs font-semibold text-primary">
            {$authUser?.name.trim().charAt(0)}
          </div>
        {/if}
      </div>
    {:else}
      <img
        src={ziggy}
        alt={translate('common.user-profile')}
        class="h-6 w-6 rounded-control object-cover"
      />
    {/if}
  </MenuButton>
  <Menu id="user-menu" position="right" class="w-80">
    {#if $authUser.accessToken}
      <MenuItem hoverable={false}>
        <div class="flex min-w-0 items-center justify-start gap-2">
          <Icon name="astronaut" />
          <p class="truncate">{$authUser?.email}</p>
        </div>
      </MenuItem>
      <MenuItem onclick={logout}>
        <div class="flex items-center justify-start gap-2">
          <Icon name="logout" />
          {translate('common.log-out')}
        </div>
      </MenuItem>
      <MenuDivider />
    {:else}
      <MenuItem disabled>Anonymous Tardigrade</MenuItem>
      <MenuDivider />
    {/if}
    <MenuItem hoverable={false}>
      {translate('common.theme')}
      <DarkModeMenu />
    </MenuItem>
    <MenuItem hoverable={false}>
      {translate('common.palette')}
      <PaletteMenu />
    </MenuItem>
    <MenuDivider />
    <MenuItem
      hoverable={false}
      class="text-subtle"
      newTab
      href="https://t.mp/slack"
    >
      {translate('common.slack-community')}
    </MenuItem>
    <MenuItem
      hoverable={false}
      class="text-subtle"
      newTab
      href="https://community.temporal.io/"
    >
      {translate('common.community-forum')}
    </MenuItem>
    <MenuItem
      hoverable={false}
      class="text-subtle"
      newTab
      href="https://temporal.io/change-log"
    >
      {translate('common.change-log')}
    </MenuItem>
  </Menu>
</MenuContainer>

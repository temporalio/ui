<script lang="ts">
  import DarkModeMenu from '$lib/components/dark-mode-menu.svelte';
  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuItem,
  } from '$lib/holocene/menu';
  import { translate } from '$lib/i18n/translate';
  import { authUser } from '$lib/stores/auth-user';

  import Icon from './icon/icon.svelte';
  import MenuDivider from './menu/menu-divider.svelte';

  export let logout: () => void;

  let showProfilePic = true;

  function fixImage() {
    showProfilePic = false;
  }
</script>

<MenuContainer>
  <MenuButton variant="ghost" hasIndicator controls="user-menu">
    {#if $authUser.accessToken}
      <img
        src={$authUser?.picture}
        alt={$authUser?.profile ?? translate('common.user-profile')}
        class="h-[24px] w-[24px] cursor-pointer"
        on:error={fixImage}
        class:hidden={!showProfilePic}
      />
      <div
        class="aspect-square h-full w-[24px] bg-blue-200 p-0.5"
        class:hidden={showProfilePic}
      >
        {#if $authUser?.name}
          <div class="text-center text-sm text-black">
            {$authUser?.name.trim().charAt(0)}
          </div>
        {/if}
      </div>
    {:else}
      <img
        src="/ziggy-full-face.png"
        alt={translate('common.user-profile')}
        class="h-[24px] w-[24px]"
      />
    {/if}
  </MenuButton>
  <Menu id="user-menu" position="right" class="w-60">
    {#if $authUser.accessToken}
      <MenuItem hoverable={false}>
        <div class="flex items-center justify-start gap-4">
          <Icon name="astronaut" />
          <p>{$authUser?.email}</p>
        </div>
      </MenuItem>
      <MenuItem on:click={logout}>
        <div class="flex items-center justify-start gap-4">
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

<script lang="ts">
  import { appPalette } from '$lib/components/app-palette/app-palette-state.svelte';
  import NavigationButton from '$lib/holocene/navigation/navigation-button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconAstronaut, IconKeyboard, IconLogout } from '$lib/io/icon';
  import { authUser } from '$lib/stores/auth-user';

  interface Props {
    logout: () => void;
  }

  let { logout }: Props = $props();
</script>

{#if $authUser.accessToken}
  <div class="border-b border-primary"></div>
  <NavigationButton
    tooltip={$authUser.email}
    label={$authUser.email ?? ''}
    Icon={IconAstronaut}
    data-testid="email"
    disabled
  />
  <NavigationButton
    onClick={logout}
    tooltip={translate('common.log-out')}
    label={translate('common.log-out')}
    Icon={IconLogout}
    data-testid="log-out"
  />
{/if}
{#if appPalette.available}
  <NavigationButton
    onClick={() => (appPalette.open = true)}
    tooltip={translate('palette.label')}
    label={translate('palette.label')}
    Icon={IconKeyboard}
    data-testid="command-palette"
  />
{/if}

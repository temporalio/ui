<script lang="ts">
  import NavigationButton from '$lib/anthropocene/navigation/navigation-button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { authUser } from '$lib/stores/auth-user';

  interface Props {
    logout: () => void;
  }

  let { logout }: Props = $props();
</script>

{#if $authUser.accessToken}
  <div class="border-b border-subtle"></div>
  <NavigationButton
    tooltip={$authUser.email}
    label={$authUser.email}
    icon="astronaut"
    data-testid="email"
    disabled
  />
  <NavigationButton
    onClick={logout}
    tooltip={translate('common.log-out')}
    label={translate('common.log-out')}
    icon="logout"
    data-testid="log-out"
  />
{/if}

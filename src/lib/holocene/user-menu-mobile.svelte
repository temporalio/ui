<script lang="ts">
  import NavigationButton from '$lib/holocene/navigation/navigation-button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { authUser } from '$lib/stores/auth-user';

  export let logout: () => void;
</script>

{#if $authUser.accessToken}
  <div class="border-b-2 border-subtle" />
  <NavigationButton
    tooltip={$authUser.email}
    label={$authUser.email}
    icon="astronaut"
    data-testid="email"
  />
  <NavigationButton
    onClick={logout}
    tooltip={translate('common.log-out')}
    label={translate('common.log-out')}
    icon="exit"
    data-testid="log-out"
  />
{/if}

<script lang="ts">
  import { goto } from '$app/navigation';
  import { routeForLoginPage } from '$lib/utilities/route-for';

  import Navigation from '$lib/holocene/navigation/full-nav.svelte';
  import DataEncoderStatus from '$lib/holocene/data-encoder-status.svelte';
  import { showDataEncoderSettings } from '$lib/stores/show-data-encoder';
  import { clearAuthUser } from '$lib/stores/auth-user';

  export let user: User;
  const logout = () => {
    clearAuthUser();
    goto(routeForLoginPage());
  };
</script>

<Navigation
  user={Promise.resolve(user)}
  {logout}
  extras={[
    {
      component: DataEncoderStatus,
      name: 'Data Encoder',
      onClick: () => ($showDataEncoderSettings = true),
    },
  ]}
/>

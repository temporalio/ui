<script lang="ts">
  import NavigationHeader from '$lib/components/navigation-header.svelte';
  import { routeForImport } from '$lib/utilities/route-for';
  import NavigationLink from '$lib/components/navigation-link.svelte';
  import AuthButton from '$lib/components/auth-button.svelte';

  export let user: User;
</script>

<NavigationHeader href="/">
  <svelte:fragment slot="links">
    <NavigationLink href={routeForImport({ importType: 'events' })}>
      Import
    </NavigationLink>
  </svelte:fragment>
  <svelte:fragment slot="user">
    <AuthButton {user} />
  </svelte:fragment>
</NavigationHeader>

<script lang="ts">
  import { routeForImport } from '$lib/utilities/route-for';

  import NavigationLink from '$lib/components/navigation-link.svelte';
  import HamburgerHeader from '$lib/components/hamburger-header.svelte';
  import AuthButton from '$lib/components/auth-button.svelte';

  export let user: User;
</script>

<HamburgerHeader href="/">
  <svelte:fragment slot="links">
    <NavigationLink href={routeForImport({ importType: 'events' })}>
      Import
    </NavigationLink>
  </svelte:fragment>
  <svelte:fragment slot="user">
    <AuthButton {user} />
  </svelte:fragment>
</HamburgerHeader>

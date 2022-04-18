<script lang="ts">
  import NavigationHeader from '$lib/components/navigation-header.svelte';
  import { routeForImport } from '$lib/utilities/route-for';
  import NavigationLink from '../_navigation-link.svelte';

  export let user: User;
</script>

<NavigationHeader {user} href="/">
  <svelte:fragment slot="links">
    <NavigationLink href={routeForImport({ importType: 'events' })}>
      Import
    </NavigationLink>
  </svelte:fragment>
</NavigationHeader>

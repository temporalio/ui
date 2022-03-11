<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { routeFor } from '$lib/utilities/route-for';

  onMount(async () => {
    goto(
      routeFor('workflows', {
        namespace: $page.stuff.settings.defaultNamespace,
      }),
      {
        replaceState: true,
      },
    );
  });
</script>

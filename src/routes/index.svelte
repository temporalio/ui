<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { routeForWorkflows } from '$lib/utilities/route-for';

  onMount(async () => {
    goto(
      routeForWorkflows({
        namespace: $page.stuff.settings.defaultNamespace,
      }),
      {
        replaceState: true,
      },
    );
  });
</script>

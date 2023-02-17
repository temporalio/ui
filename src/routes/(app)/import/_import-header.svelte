<script lang="ts">
  import { page } from '$app/stores';
  import ImportNavigation from '$lib/holocene/navigation/import-nav.svelte';

  import {
    routeForEventHistoryImport,
    routeForWorkflows,
  } from '$lib/utilities/route-for';

  const { isCloud } = $page.data?.settings?.runtimeEnvironment;
  $: namespace = $page.data?.settings?.defaultNamespace;

  $: linkList = {
    home: routeForWorkflows({ namespace }),
    import: routeForEventHistoryImport(),
  };
</script>

<ImportNavigation {linkList} {isCloud} />

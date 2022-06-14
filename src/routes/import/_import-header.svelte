<script lang="ts">
  import { page } from '$app/stores';
  import ImportNavigation from '$lib/holocene/navigation/import-nav.svelte';

  import { routeForImport, routeForWorkflows } from '$lib/utilities/route-for';

  const { isCloud } = $page.stuff.settings.runtimeEnvironment;
  $: namespace = $page.stuff?.settings?.defaultNamespace;

  $: linkList = {
    home: routeForWorkflows({ namespace }),
    import: routeForImport({ importType: 'events' }),
  };
</script>

<ImportNavigation {linkList} {isCloud} />

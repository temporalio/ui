<script lang="ts">
  import { page } from '$app/stores';
  import Navigation from 'holocene/components/navigation/import.svelte';

  import { routeForImport, routeForWorkflows } from '$lib/utilities/route-for';

  $: namespace = $page.stuff?.settings?.defaultNamespace;

  $: linkList = {
    home: routeForWorkflows({ namespace }),
    import: routeForImport({ importType: 'events' }),
  };
</script>

<Navigation theme="developer" {linkList} />

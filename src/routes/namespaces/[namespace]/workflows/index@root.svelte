<script lang="ts">
  import { page } from '$app/stores';

  import Workflows from '$lib/pages/workflows.svelte';
  import PageTitle from '$lib/components/page-title.svelte';
  import { temporalVersion } from '$lib/stores/versions';
  import { isVersionNewer } from '$lib/utilities/version-check';
</script>

<PageTitle
  title={`Workflows | ${$page.params.namespace}`}
  url={$page.url.href}
/>

<Workflows bulkActionsEnabled={isVersionNewer($temporalVersion, '1.18.0')} />

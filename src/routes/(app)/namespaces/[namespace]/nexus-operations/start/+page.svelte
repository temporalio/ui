<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import StartNexusOperationExecution from '$lib/pages/start-standalone-nexus-operation.svelte';

  const namespace = $derived(page.params.namespace);
</script>

<PageTitle
  title="{translate(
    'standalone-nexus-operations.start-standalone-nexus-operation',
  )} | {namespace}"
  url={page.url.href}
/>

<StartNexusOperationExecution {namespace} />

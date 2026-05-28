<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import StandaloneNexusOperations from '$lib/pages/standalone-nexus-operations.svelte';

  const namespace = $derived(page.params.namespace);
</script>

<PageTitle
  title="{translate(
    'standalone-nexus-operations.standalone-nexus-operations',
  )} | {namespace}"
  url={page.url.href}
/>

<StandaloneNexusOperations />

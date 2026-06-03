<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import StandaloneNexusOperations from '$lib/pages/standalone-nexus-operations.svelte';
  import { routeForStartStandaloneNexusOperation } from '$lib/utilities/route-for';

  const namespace = $derived(page.params.namespace);
</script>

<PageTitle
  title="{translate(
    'standalone-nexus-operations.standalone-nexus-operations',
  )} | {namespace}"
  url={page.url.href}
/>

<StandaloneNexusOperations>
  {#snippet headerActions()}
    <Button href={routeForStartStandaloneNexusOperation({ namespace })}>
      {translate(
        'standalone-nexus-operations.start-standalone-nexus-operation',
      )}
    </Button>
  {/snippet}
</StandaloneNexusOperations>

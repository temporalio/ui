<script lang="ts">
  import { page } from '$app/state';

  import type { PageProps } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import WorkflowRelationships from '$lib/components/workflow/workflow-relationships.svelte';
  import { translate } from '$lib/i18n/translate';

  let { params }: PageProps = $props();
  const { namespace, workflow } = $derived(params);
</script>

<PageTitle
  title={`${translate('workflows.relationships')} | ${workflow}`}
  url={page.url.href}
/>
<WorkflowRelationships {namespace} />

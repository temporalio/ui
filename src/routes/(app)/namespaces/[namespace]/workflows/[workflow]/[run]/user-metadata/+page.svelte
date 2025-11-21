<script lang="ts">
  import { page } from '$app/state';

  import type { PageProps } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowUserMetadata from '$lib/pages/workflow-user-metadata.svelte';

  let { params }: PageProps = $props();
  const { workflow } = $derived(params);
</script>

<PageTitle
  title={`${translate('workflows.user-metadata-tab')} | ${workflow}`}
  url={page.url.href}
/>
<WorkflowUserMetadata {...params} />

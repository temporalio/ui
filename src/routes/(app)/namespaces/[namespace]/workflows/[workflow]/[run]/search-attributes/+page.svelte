<script lang="ts">
  import { page } from '$app/state';

  import type { PageProps } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowSearchAttributes from '$lib/pages/workflow-search-attributes.svelte';

  let { params }: PageProps = $props();
  const { workflow } = $derived(params);
</script>

<PageTitle
  title={`${translate('workflows.search-attributes-tab')} | ${workflow}`}
  url={page.url.href}
/>
<WorkflowSearchAttributes />

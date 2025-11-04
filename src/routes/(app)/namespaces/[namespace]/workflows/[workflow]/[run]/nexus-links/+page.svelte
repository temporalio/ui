<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowNexusLinks from '$lib/pages/workflow-nexus-links.svelte';

  const workflow = $page.params.workflow;
</script>

<PageTitle
  title={`${translate('workflows.nexus-links-tab')} | ${workflow}`}
  url={$page.url.href}
/>
<WorkflowNexusLinks />

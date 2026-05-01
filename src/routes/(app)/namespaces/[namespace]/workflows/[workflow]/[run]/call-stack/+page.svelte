<svelte:options runes />

<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowCallStack from '$lib/pages/workflow-call-stack.svelte';
</script>

<PageTitle
  title={`${translate('workflows.call-stack-tab')} | ${page.params.workflow}`}
  url={page.url.href}
/>
<WorkflowCallStack />

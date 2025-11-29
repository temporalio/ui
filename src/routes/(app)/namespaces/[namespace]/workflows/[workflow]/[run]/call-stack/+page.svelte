<script lang="ts">
  import { page } from '$app/state';

  import type { PageProps } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowCallStack from '$lib/pages/workflow-call-stack.svelte';

  let { params }: PageProps = $props();
  const { workflow } = $derived(params);
</script>

<PageTitle
  title={`${translate('workflows.call-stack-tab')} | ${workflow}`}
  url={page.url.href}
/>
<WorkflowCallStack {...params} />

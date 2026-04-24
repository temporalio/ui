<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowChat from '$lib/pages/workflow-chat.svelte';

  const { workflow } = $derived(page.params);
</script>

<PageTitle
  title={`${translate('workflows.chat-tab')} | ${workflow}`}
  url={page.url.href}
/>
<WorkflowChat />

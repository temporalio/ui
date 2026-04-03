<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { isRunningWithNoWorkers } from '$lib/utilities/is-running-with-no-workers';

  const { workflow } = $derived($workflowRun);
  const runningWithNoWorkers = $derived(isRunningWithNoWorkers($workflowRun));
</script>

<Alert
  icon="warning"
  intent="warning"
  title={translate('workflows.workflow-error-no-workers-title')}
  class="max-w-screen-lg xl:w-2/3"
  hidden={!runningWithNoWorkers}
>
  {translate('workflows.workflow-error-no-workers-description', {
    taskQueue: workflow?.taskQueue ?? '',
  })}
  {translate('workflows.workers-alert-description')}
  <Link
    href="https://docs.temporal.io/develop/worker-performance"
    newTab
    class="mt-2 flex items-center gap-1"
  >
    {translate('workers.troubleshooting-workers-link')}
    <Icon name="arrow-right" />
  </Link>
</Alert>

<script lang="ts">
  import DetailListLabel from '$lib/components/detail-list/detail-list-label.svelte';
  import DetailListLinkValue from '$lib/components/detail-list/detail-list-link-value.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconFilter } from '$lib/io/icon';
  import { routeForWorkflowsWithQuery } from '$lib/utilities/route-for';

  import type { ScheduledActionViewProps } from '../types';

  let {
    resolvedAction,
    namespace,
    scheduleId,
  }: ScheduledActionViewProps<'workflow'> = $props();

  const workflowType = $derived(
    resolvedAction.schedule.schedule.action.startWorkflow.workflowType?.name,
  );
</script>

<DetailListLabel class="flex min-h-6 items-center">
  {translate('common.workflow-type')}
</DetailListLabel>
<DetailListLinkValue
  href={routeForWorkflowsWithQuery({
    namespace,
    query: [
      `WorkflowType="${workflowType}"`,
      `TemporalScheduledById="${scheduleId}"`,
    ].join(' AND '),
  }) ?? ''}
  text={workflowType ?? ''}
  Icon={IconFilter}
  copyable={Boolean(workflowType)}
  copyableText={workflowType ?? undefined}
/>

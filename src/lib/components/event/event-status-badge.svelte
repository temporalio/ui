<script lang="ts" module>
  import type { BadgeColorScheme } from '$lib/io/badge';
  import type { EventClassification } from '$lib/models/event-history/get-event-classification';

  export type EventStatus =
    | EventClassification
    | 'Paused'
    | 'Pending'
    | 'Retrying';

  const colorSchemes: Record<EventStatus, BadgeColorScheme> = {
    Unspecified: 'neutral',
    Scheduled: 'info',
    Open: 'success',
    New: 'info',
    Started: 'info',
    Initiated: 'info',
    Running: 'info',
    Completed: 'success',
    Fired: 'accent',
    CancelRequested: 'warning',
    TimedOut: 'error',
    Signaled: 'accent',
    Canceled: 'neutral',
    Failed: 'danger',
    Terminated: 'warning',
    Paused: 'info',
    Pending: 'accent',
    Retrying: 'danger',
  };
</script>

<script lang="ts">
  import { Badge } from '$lib/io/badge';
  import { getEventClassificationLabel } from '$lib/utilities/get-event-classification-label';
  import { getWorkflowStatusLabel } from '$lib/utilities/get-workflow-status-label';

  interface Props {
    status: EventStatus;
  }

  let { status }: Props = $props();

  const text = $derived(
    status === 'Paused'
      ? getWorkflowStatusLabel(status)
      : getEventClassificationLabel(status),
  );
</script>

<Badge
  {text}
  colorScheme={colorSchemes[status]}
  data-testid="execution-status"
/>

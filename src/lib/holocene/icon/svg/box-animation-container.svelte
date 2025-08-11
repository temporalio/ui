<script lang="ts">
  import EventDetailsFull from '$lib/components/event/event-details-full.svelte';
  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import type { WorkflowEvent } from '$lib/types/events';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import BoxAnimation from './box-animation.svelte';

  let {
    workflow,
    history,
  }: { workflow: WorkflowExecution; history: WorkflowEvent[] } = $props();

  const pendingActivities = $derived(workflow?.pendingActivities || []);
  const pendingNexusOperations = $derived(
    workflow?.pendingNexusOperations || [],
  );
  const groups = $derived(
    groupEvents(
      history,
      'ascending',
      pendingActivities,
      pendingNexusOperations,
    ),
  );

  let group: EventGroup | undefined = $state(undefined);

  const onClick = (_group: EventGroup) => {
    if (group?.id === _group.id) {
      group = undefined;
      return;
    }
    group = _group;
  };
</script>

<div class="rounded-sm border border-subtle bg-primary px-8">
  <BoxAnimation {groups} {onClick} />
  <EventDetailsFull {group} />
</div>

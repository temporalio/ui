<script lang="ts">
  import { pick } from '$lib/utilities/pick';

  import EventSummary from '$lib/components/event-summary.svelte';
  import EventDetails from '$lib/components/event-details.svelte';
  import EventSummaryAttributes from '$lib/components/event-summary-attributes.svelte';
  import EventLabel from '$lib/components/event-label.svelte';

  export let activity: PendingActivity;

  const summaryAttributes = pick<PendingActivity, keyof PendingActivity>(
    activity,
    'attempts',
    'maximumAttempts',
    'lastHeart',
    'expiration',
  );

  const hash = `#pending-${activity.activityId}`;
</script>

<EventSummary {hash}>
  <div class="flex items-start p-4 mx-4">
    <h2 class="w-1/3">
      <EventLabel>
        {activity?.activityType?.name}
      </EventLabel>
      <EventLabel color={activity.state}>
        {activity.state}
      </EventLabel>
    </h2>
    <EventSummaryAttributes attributes={summaryAttributes} />
  </div>
  <EventDetails attributes={activity} slot="expanded" />
</EventSummary>

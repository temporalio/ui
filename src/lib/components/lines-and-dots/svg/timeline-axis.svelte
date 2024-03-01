<script lang="ts">
  // import { getMilliseconds } from 'date-fns';
  // import { timeFormat } from '$lib/stores/time-format';
  // import { workflowRun } from '$lib/stores/workflow-run';
  // import { formatDate } from '$lib/utilities/format-date';
  // import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  import { HistoryConfig } from '../constants';

  import Line from './line.svelte';
  import Text from './text.svelte';

  export let x1 = 0;
  export let x2 = 1000;
  export let y = 1000;

  const ticks = 20;

  // $: ({ workflow } = $workflowRun);
  // $: duration =
  //   getMilliseconds(new Date(workflow.endTime)) -
  //   getMilliseconds(new Date(workflow.startTime));

  const { radius } = HistoryConfig;

  $: distance = x2 - x1;
  $: tickDistance = distance / ticks;
</script>

<Line
  strokeWidth={radius / 2}
  startPoint={[x1, y]}
  endPoint={[x1 + distance, y]}
  status="none"
/>
{#each Array(ticks) as _, i}
  <Line
    strokeWidth={radius / 2}
    startPoint={[x1 + i * tickDistance, y - 10]}
    endPoint={[x1 + i * tickDistance, y]}
    status="none"
  />
  <Text
    point={[x1 + i * tickDistance - radius, y - radius * 2]}
    textAnchor="start"
  ></Text>
{/each}

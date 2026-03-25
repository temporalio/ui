<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import type { ActivityExecutionRunState } from '$lib/types/activity-execution';
  import { fromScreamingEnum } from '$lib/utilities/screaming-enums';

  interface Props {
    state: ActivityExecutionRunState;
  }

  let { state }: Props = $props();
</script>

<Badge>
  {fromScreamingEnum(state, 'PendingActivityState')}
</Badge>

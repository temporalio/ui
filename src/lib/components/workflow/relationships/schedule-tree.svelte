<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import {
    routeForRelationships,
    routeForSchedule,
  } from '$lib/utilities/route-for';

  import ContinueAsNewNode from './continue-as-new-node.svelte';

  export let namespace: string;
  export let workflowId: string;
  export let scheduleId: string;
  export let current: string;
</script>

<div
  class="-mt-4 flex w-full flex-col items-center justify-between gap-4 bg-primary px-8 py-12 xl:px-32"
>
  <ContinueAsNewNode
    label="Schedule"
    value={scheduleId}
    href={routeForSchedule({
      namespace: namespace,
      scheduleId,
    })}
  />
  <div class="border-top border-1 h-24 w-1 bg-indigo-700 dark:bg-indigo-300" />
  <ContinueAsNewNode
    label={translate('workflows.current-execution')}
    value={current}
    href={routeForRelationships({
      namespace,
      workflow: workflowId,
      run: current,
    })}
    current
  />
</div>

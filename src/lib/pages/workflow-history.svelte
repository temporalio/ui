<script lang="ts">
  import { onMount } from 'svelte';

  import { goto } from '$app/navigation';

  import { eventFilterSort } from '$lib/stores/event-view';
  import { routeForEventHistory } from '$lib/utilities/route-for';

  interface Props {
    namespace: string;
    workflow: string;
    run: string;
  }

  let { namespace, workflow, run }: Props = $props();

  onMount(async () => {
    const queryParams = {
      sort: $eventFilterSort,
    };

    goto(
      routeForEventHistory({
        queryParams,
        namespace,
        workflow,
        run,
      }),
      {
        replaceState: true,
      },
    );
  });
</script>

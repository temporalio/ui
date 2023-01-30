<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  import { routeForEventHistory } from '$lib/utilities/route-for';
  import { eventFilterSort } from '$lib/stores/event-view';

  const { namespace, workflow, run } = $page.params;

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

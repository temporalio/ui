<script lang="ts">
  import { onMount } from 'svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import { eventFilterSort } from '$lib/stores/event-view';
  import { routeForEventHistory } from '$lib/utilities/route-for';

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

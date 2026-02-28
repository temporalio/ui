<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/state';

  import { eventFilterSort } from '$lib/stores/event-view';
  import { gotoResolved } from '$lib/utilities/goto-resolved';
  import { routeForEventHistory } from '$lib/utilities/route-for';

  const { namespace, workflow, run } = page.params;

  onMount(async () => {
    const queryParams = {
      sort: $eventFilterSort,
    };

    gotoResolved(
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

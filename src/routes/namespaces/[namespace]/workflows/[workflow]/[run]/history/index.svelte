<script lang="ts">
  import { goto } from '$app/navigation';
  import { eventViewType } from '$lib/stores/event-view-type';
  import { onMount } from 'svelte';
  import { routeForEventHistory } from '$lib/utilities/route-for';
  import { page } from '$app/stores';

  const { namespace, workflow, run } = $page.params;

  onMount(async () => {
    const view = $eventViewType;
    goto(
      routeForEventHistory({
        view,
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

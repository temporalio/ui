<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import Schedules from '$lib/pages/schedules.svelte';
</script>

<PageTitle title="Deployments" url={$page.url.href} />
<Schedules />

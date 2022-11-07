<script lang="ts">
  import { page } from '$app/stores';

  import SchedulesCreate from '$lib/pages/schedules-create.svelte';
  import PageTitle from '$lib/components/page-title.svelte';

  const namespace = $page.params.namespace;
</script>

<PageTitle title={`Create Schedule | ${namespace}`} url={$page.url.href} />
<SchedulesCreate />

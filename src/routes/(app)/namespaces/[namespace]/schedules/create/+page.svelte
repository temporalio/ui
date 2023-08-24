<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import SchedulesCreate from '$lib/pages/schedules-create.svelte';

  const namespace = $page.params.namespace;
</script>

<PageTitle title={`Create Schedule | ${namespace}`} url={$page.url.href} />
<SchedulesCreate />

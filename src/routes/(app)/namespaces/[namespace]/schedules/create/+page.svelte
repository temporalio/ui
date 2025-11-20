<script lang="ts">
  import { page } from '$app/state';

  import type { PageProps } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import SchedulesCreate from '$lib/pages/schedules-create.svelte';

  let { params }: PageProps = $props();
  const { namespace } = $derived(params);
</script>

<PageTitle title={`Create Schedule | ${namespace}`} url={page.url.href} />
<SchedulesCreate {...params} />

<script lang="ts">
  import { page } from '$app/state';

  import type { PageProps } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import Schedules from '$lib/pages/schedules.svelte';

  let { params }: PageProps = $props();
</script>

<PageTitle title={`Schedules | ${params.namespace}`} url={page.url.href} />
<Schedules {...params} />

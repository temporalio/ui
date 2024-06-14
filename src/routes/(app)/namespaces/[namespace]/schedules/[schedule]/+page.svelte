<script lang="ts">
  import { CloudService } from '@buf/temporal_api-cloud.connectrpc_es/temporal/api/cloud/cloudservice/v1/service_connect';
  import { createPromiseClient } from '@connectrpc/connect';
  import { createGrpcWebTransport } from '@connectrpc/connect-web';

  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import ScheduleView from '$lib/pages/schedule-view.svelte';

  const schedule = $page.params.schedule;

  const transport = createGrpcWebTransport({ baseUrl: '', interceptors: [] });

  const cloudService = createPromiseClient(CloudService, transport);
</script>

<PageTitle title={`Schedule | ${schedule}`} url={$page.url.href} />
<ScheduleView />

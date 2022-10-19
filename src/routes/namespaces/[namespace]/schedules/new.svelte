<script lang="ts">
  import { page } from '$app/stores';

  import SchedulesNew from '$lib/pages/schedules-new.svelte';
  import PageTitle from '$lib/holocene/page-title.svelte';
</script>

<PageTitle
  title={`Create Schedule | ${$page.params.namespace}`}
  url={$page.url.href}
/>
<SchedulesNew />

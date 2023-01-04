<script lang="ts">
  import { page } from '$app/stores';
  import PageTitle from '$lib/components/page-title.svelte';

  import ScheduleEdit from '$lib/pages/schedule-edit.svelte';
</script>

<PageTitle
  title={`Schedule Edit | ${$page.params.schedule}`}
  url={$page.url.href}
/>
<ScheduleEdit />

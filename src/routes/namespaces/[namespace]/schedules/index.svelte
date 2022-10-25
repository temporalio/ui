<script lang="ts">
  import { page } from '$app/stores';

  import Schedules from '$lib/pages/schedules.svelte';
  import PageTitle from '$lib/components/page-title.svelte';
</script>

<PageTitle
  title={`Schedules | ${$page.params.namespace}`}
  url={$page.url.href}
/>
<Schedules />

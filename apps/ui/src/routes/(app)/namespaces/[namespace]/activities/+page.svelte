<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import StandaloneActivities from '$lib/pages/standalone-activities.svelte';

  const namespace = $derived(page.params.namespace);
</script>

<PageTitle
  title="{translate(
    'standalone-activities.standalone-activities',
  )} | {namespace}"
  url={page.url.href}
/>
<StandaloneActivities />

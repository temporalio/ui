<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import StartActivityExecution from '$lib/pages/start-standalone-activity.svelte';

  const namespace = $derived(page.params.namespace);
</script>

<PageTitle
  title="{translate(
    'standalone-activities.start-standalone-activity',
  )} | {namespace}"
  url={page.url.href}
/>

<StartActivityExecution {namespace} />

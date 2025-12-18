<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import StandaloneActivityForm from '$lib/components/standalone-activity-form/form.svelte';
  import { translate } from '$lib/i18n/translate';

  const namespace = $derived(page.params.namespace);
</script>

<PageTitle
  title="{translate('activities.start-standalone-activity')} | {namespace}"
  url={page.url.href}
/>

<h1>{translate('activities.start-standalone-activity')}</h1>

<StandaloneActivityForm {namespace} />

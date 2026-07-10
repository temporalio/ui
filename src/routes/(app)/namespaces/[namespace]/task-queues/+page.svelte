<svelte:options runes />

<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
</script>

<PageTitle
  title={`${translate('workers.task-queues')} | ${page.params.namespace}`}
  url={page.url.href}
/>

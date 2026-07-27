<script lang="ts">
  import type { Snippet } from 'svelte';

  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import ImportEventsView from '$lib/pages/import-events-view.svelte';
  import { routeForEventHistoryImport } from '$lib/utilities/route-for';

  interface Props {
    children: Snippet;
  }
  let { children }: Props = $props();
</script>

<Link
  href={routeForEventHistoryImport()}
  data-testid="back-to-import"
  icon="chevron-left"
>
  {translate('events.back-to-import')}
</Link>
<ImportEventsView>
  {@render children()}
</ImportEventsView>

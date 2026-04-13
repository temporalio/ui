<script lang="ts">
  import NoQueryResults from '$lib/components/empty-states/no-query-results.svelte';
  import { translate } from '$lib/i18n/translate';
</script>

<div
  class="my-12 flex w-full flex-col items-center justify-start gap-2"
  aria-live="polite"
>
  <div class="text-center">
    <h2>
      {translate('workers.empty-state-title')}
    </h2>
    <p class="text-secondary">
      {translate('workers.worker-query-empty-state-description')}
    </p>
  </div>
  <NoQueryResults class="m-auto mt-8 text-subtle" />
</div>

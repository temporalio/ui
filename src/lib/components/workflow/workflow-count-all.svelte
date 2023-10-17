<script lang="ts">
  import Spinner from '$lib/holocene/icon/svg/spinner.svelte';
  import { translate } from '$lib/i18n/translate';
  import { loading, updating } from '$lib/stores/workflows';

  export let count = 0;
</script>

<div class="font-base flex text-center text-sm leading-4">
  <p data-testid="workflow-count" data-loaded={!$loading && !$updating}>
    {#if $loading || $updating}
      <Spinner class="h-4 w-4 animate-spin" />
    {:else if count >= 0}
      {count.toLocaleString()}
      {translate('common.workflows').toLocaleLowerCase()}
    {/if}
  </p>
</div>

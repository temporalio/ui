<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import { loading, updating } from '$lib/stores/workflows';

  export let count = 0;
</script>

<div class="font-base flex text-center text-sm leading-4">
  <p
    class="flex items-center"
    data-testid="workflow-count"
    data-loaded={!$loading && !$updating}
  >
    {count.toLocaleString()}
    {translate('common.workflows').toLocaleLowerCase()}
  </p>
</div>

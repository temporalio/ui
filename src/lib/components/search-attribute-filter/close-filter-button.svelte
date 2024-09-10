<script lang="ts">
  import { getContext } from 'svelte';

  import IconButton from '$lib/holocene/icon-button.svelte';
  import { translate } from '$lib/i18n/translate';

  import { FILTER_CONTEXT, type FilterContext } from './index.svelte';

  const { resetFilter } = getContext<FilterContext>(FILTER_CONTEXT);
</script>

<IconButton
  label={translate('common.close')}
  icon="close"
  on:click={resetFilter}
  class="ml-1"
/>

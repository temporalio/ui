<script lang="ts">
  import { getContext } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';

  import { FILTER_CONTEXT, type FilterContext } from './index.svelte';

  const { resetFilter } = getContext<FilterContext>(FILTER_CONTEXT);
</script>

<Button
  aria-label={translate('close')}
  leadingIcon="close"
  on:click={resetFilter}
  style="padding: 0; margin-left: 0.25rem"
  variant="ghost"
/>

<script lang="ts">
  import { getContext } from 'svelte';
  
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  
  import { FILTER_CONTEXT, type FilterContext } from './index.svelte';

  const { resetFilter } = getContext<FilterContext>(FILTER_CONTEXT);
</script>

<Button
  aria-label={translate('close')}
  borderRadiusModifier="square-left"
  leadingIcon="chevron-left"
  on:click={resetFilter}
  style="padding: 0"
  variant="table-header"
/>

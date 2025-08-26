<script lang="ts">
  import { getContext } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { isNullConditional } from '$lib/utilities/is';

  import { FILTER_CONTEXT, type FilterContext } from '../index.svelte';

  const { filter, handleSubmit } = getContext<FilterContext>(FILTER_CONTEXT);
  const options = [
    { value: 'true', label: translate('common.true') },
    { value: 'false', label: translate('common.false') },
    { value: 'is', label: translate('common.is-null') },
    { value: 'is not', label: translate('common.is-not-null') },
  ];
</script>

<div class="flex flex-wrap items-center gap-2">
  {#each options as { value, label }}
    <Button
      variant={$filter.conditional === value ? 'primary' : 'secondary'}
      on:click={() => {
        if (isNullConditional(value)) {
          $filter.conditional = value;
          $filter.value = null;
        } else {
          $filter.conditional = '=';
          $filter.value = value;
        }
        handleSubmit();
      }}
      class="text-nowrap"
    >
      {label}
    </Button>
  {/each}
</div>

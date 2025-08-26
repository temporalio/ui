<script lang="ts">
  import { getContext } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { isNullConditional } from '$lib/utilities/is';

  import { FILTER_CONTEXT, type FilterContext } from './filter.svelte';

  const { filter, focusedElementId } =
    getContext<FilterContext>(FILTER_CONTEXT);
  const defaultConditionOptions = [
    { value: '>' },
    { value: '>=' },
    { value: '=' },
    { value: '!=' },
    { value: '<=' },
    { value: '<' },
  ];

  export let options: { value: string; label?: string }[] =
    defaultConditionOptions;
  export let inputId: string;

  let conditionalOptions = [
    ...options,
    { value: 'is', label: translate('common.is-null') },
    { value: 'is not', label: translate('common.is-not-null') },
  ];

  $: filterConditionalOption = conditionalOptions.find(
    (o) => o.value === $filter.conditional,
  );
  $: filterConditionalOption, updateFilterConditional();

  function handleNullFilter() {
    $filter.value = null;
    $filter.customDate = false;
  }

  function updateFilterConditional() {
    if (!filterConditionalOption)
      $filter.conditional = conditionalOptions[0].value;
  }
</script>

<div class="flex flex-wrap items-center justify-start gap-2">
  {#each conditionalOptions as { value, label }}
    <Button
      variant={$filter.conditional === value ? 'primary' : 'secondary'}
      size="xs"
      on:click={() => {
        $filter.conditional = value;
        $focusedElementId = inputId;
        if (isNullConditional(value)) handleNullFilter();
      }}
    >
      {label ?? value}
    </Button>
  {/each}
</div>

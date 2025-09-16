<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';

  // let view: 'filter' | 'search' = $state('filter');
  let query = $state('');
</script>

{#snippet viewToggleButtons()}
  <div class="flex items-center gap-1 border-r border-subtle pr-1">
    <Button variant="secondary" size="xs" leadingIcon="rocket-ship" />
    <Button variant="ghost" size="xs" leadingIcon="filter" />
  </div>
{/snippet}

{#snippet actionToggleButtons()}
  <div class="flex items-center gap-1">
    <Button variant="ghost" size="xs" leadingIcon="json" />
    <Button variant="primary" size="xs">{translate('common.save')}</Button>
    <Button variant="secondary" size="xs">{translate('common.discard')}</Button>
  </div>
{/snippet}

<div
  class="flex w-full items-center justify-between gap-2 border border-subtle bg-primary p-1.5"
>
  {@render viewToggleButtons()}
  <Input
    id="power-filter-query"
    type="search"
    placeholder="failed workflows in the last 15 minutes"
    bind:value={query}
    class="flex-grow gap-0"
    inputClass="border-none h-8"
  />
  {@render actionToggleButtons()}
</div>

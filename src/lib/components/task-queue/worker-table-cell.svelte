<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import FilterOrCopyButtons from '$lib/holocene/filter-or-copy-buttons.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  type Props = {
    attribute?: string;
    value: string;
    filterable?: boolean;
    href?: string;
    children?: Snippet;
  };
  let {
    attribute,
    value,
    filterable = false,
    href,
    children,
  }: Props = $props();
  const query = $derived(page.url.searchParams.get('query') || '');

  const onRowFilterClick = () => {
    if (query.includes(`${attribute}="`)) {
      updateQueryParameters({
        parameter: 'query',
        value: '',
        url: page.url,
        clearParameters: [attribute],
      });
    } else {
      const newQuery = query
        ? `${query} AND ${attribute}="${value}"`
        : `${attribute}="${value}"`;
      updateQueryParameters({
        parameter: 'query',
        value: newQuery,
        url: page.url,
      });
    }
  };

  let filterOrCopyButtonsVisible = $state(false);
  const showFilterOrCopy = () => (filterOrCopyButtonsVisible = true);
  const hideFilterOrCopy = () => (filterOrCopyButtonsVisible = false);
  const handleFocusOut = (e: FocusEvent) => {
    const nextTarget = e.relatedTarget as HTMLElement;
    if (
      nextTarget &&
      !['filter-button', 'copy-button'].includes(nextTarget.id)
    ) {
      hideFilterOrCopy();
    }
  };
</script>

<td
  class="relative h-8"
  onfocus={showFilterOrCopy}
  onfocusin={showFilterOrCopy}
  onfocusout={handleFocusOut}
  onmouseover={showFilterOrCopy}
  onmouseleave={hideFilterOrCopy}
  onblur={hideFilterOrCopy}
>
  {#if href}
    <Link {href}>{value}</Link>
  {:else if children}
    {@render children?.()}
  {:else}
    {value}
  {/if}
  <FilterOrCopyButtons
    copyIconTitle={translate('common.copy-icon-title')}
    copySuccessIconTitle={translate('common.copy-success-icon-title')}
    filterIconTitle={translate('common.filter-workflows')}
    show={filterOrCopyButtonsVisible}
    content={value}
    onFilter={onRowFilterClick}
    {filterable}
    filtered={query.includes(`${attribute}=`)}
  />
</td>

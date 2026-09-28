<script lang="ts">
  import type { Writable } from 'svelte/store';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  import { Badge } from '$lib/io/badge';
  import { IconSearch } from '$lib/io/icon';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import {
    fetchKnownWorkflowTypes,
    NL_SEARCH_LOW_CONFIDENCE_THRESHOLD,
    NL_SEARCH_MAX_TEXT_LENGTH,
    NLSearchError,
    toNLSearchErrorMessage,
    translateNaturalLanguageSearch,
  } from '$lib/services/nl-search-service';
  import { prefixSearchEnabled } from '$lib/stores/capability-enablement';
  import {
    NL_SEARCH_PARAMETER,
    nlSearchTrace,
    nlSearchTraceOpen,
    recordNLSearch,
  } from '$lib/stores/nl-search-trace';
  import { currentPageKey } from '$lib/stores/pagination';
  import { allSearchAttributes } from '$lib/stores/search-attributes';
  import type { SearchAttributes } from '$lib/types/workflows';
  import { toListWorkflowQueryFromFilters } from '$lib/utilities/query/filter-workflow-query';
  import { toFiltersFromNLSearch } from '$lib/utilities/query/nl-search-filters';
  import {
    updateMultipleQueryParameters,
    updateQueryParameters,
  } from '$lib/utilities/update-query-parameters';

  type Status = {
    kind: 'success' | 'hint' | 'error';
    message: string;
  };

  interface Props {
    filters: Writable<SearchAttributeFilter[]>;
    searchAttributes: SearchAttributes;
    id: string;
    onSearch?: (query: string) => void;
  }

  let { filters, searchAttributes, id, onSearch }: Props = $props();

  const urlText = $derived(
    page.url.searchParams.get(NL_SEARCH_PARAMETER) ?? '',
  );
  let text = $derived(urlText);
  let loading = $state(false);
  let status = $state<Status | null>(null);
  let requestId = 0;
  let rateLimited = $state(false);
  let rateLimitTimeout: ReturnType<typeof setTimeout> | undefined;

  const startRateLimitWindow = (seconds: number) => {
    clearTimeout(rateLimitTimeout);
    rateLimited = true;
    rateLimitTimeout = setTimeout(() => {
      rateLimited = false;
    }, seconds * 1000);
  };

  $effect(() => {
    return () => clearTimeout(rateLimitTimeout);
  });

  const query = $derived(page.url.searchParams.get('query') ?? '');
  const namespace = $derived(page.params.namespace ?? '');
  const canSubmit = $derived(
    !loading && !rateLimited && text.trim().length > 0,
  );
  const statusMessage = $derived(
    loading
      ? translate('workflows.nl-search-loading')
      : (status?.message ?? ''),
  );

  const applyFilters = (nextFilters: SearchAttributeFilter[]) => {
    const nextQuery = toListWorkflowQueryFromFilters(nextFilters);
    $filters = nextFilters;

    if (nextQuery === query && text === urlText) {
      onSearch?.(nextQuery);
    } else {
      updateMultipleQueryParameters({
        url: page.url,
        parameters: [
          { parameter: 'query', value: nextQuery },
          { parameter: NL_SEARCH_PARAMETER, value: text },
        ],
        clearParameters: [currentPageKey],
      });
    }
  };

  const rememberText = (value: string) => {
    if (value === urlText) return;
    updateQueryParameters({
      url: page.url,
      parameter: NL_SEARCH_PARAMETER,
      value,
    });
  };

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    const currentRequest = ++requestId;
    loading = true;
    status = null;

    try {
      const knownWorkflowTypes = await fetchKnownWorkflowTypes(namespace);
      const response = await translateNaturalLanguageSearch({
        namespace,
        text,
        searchAttributes,
        customAttributeNames: Object.keys(
          $allSearchAttributes.customAttributes,
        ),
        knownWorkflowTypes,
      });

      if (currentRequest !== requestId) return;

      const nextFilters = response.understood
        ? toFiltersFromNLSearch(response.filters, searchAttributes, {
            prefixSearchEnabled: $prefixSearchEnabled,
          })
        : [];

      if (!nextFilters.length) {
        recordNLSearch(text, response, null);
        rememberText(text);
        status = {
          kind: 'hint',
          message: translate('workflows.nl-search-not-understood'),
        };
        return;
      }

      applyFilters(nextFilters);
      recordNLSearch(
        text,
        response,
        toListWorkflowQueryFromFilters(nextFilters),
      );

      status =
        response.confidence < NL_SEARCH_LOW_CONFIDENCE_THRESHOLD
          ? {
              kind: 'hint',
              message: translate('workflows.nl-search-low-confidence'),
            }
          : {
              kind: 'success',
              message: translate('workflows.nl-search-applied'),
            };
    } catch (error: unknown) {
      if (currentRequest !== requestId) return;
      status = { kind: 'error', message: toNLSearchErrorMessage(error) };
      if (error instanceof NLSearchError && error.retryAfterSeconds) {
        startRateLimitWindow(error.retryAfterSeconds);
      }
    } finally {
      if (currentRequest === requestId) loading = false;
    }
  };

  let prefetchedNamespace = '';

  const handleFocus = () => {
    if (!namespace || prefetchedNamespace === namespace) return;
    prefetchedNamespace = namespace;
    fetchKnownWorkflowTypes(namespace).catch(() => {});
  };

  const handleClear = () => {
    requestId++;
    loading = false;
    status = null;
    $nlSearchTraceOpen = false;
    rememberText('');
  };
</script>

<div class="w-full min-w-0 border-t border-primary bg-surface-primary">
  <form onsubmit={handleSubmit} class="flex min-w-0 gap-0" role="search">
    <Input
      id="{id}-nl-search"
      type="search"
      label={translate('workflows.nl-search-label')}
      labelHidden
      placeholder={translate('workflows.nl-search-placeholder')}
      Icon={IconSearch}
      class="min-w-0 grow [&_*]:border-0"
      inputContainerClass="rounded-none !border-r border-primary bg-surface-primary text-primary hover:border-primary focus-within:z-20 focus-within:ring-inset focus-within:ring-offset-0"
      clearable
      clearButtonLabel={translate('common.clear-input-button-label')}
      onClear={handleClear}
      onfocus={handleFocus}
      bind:value={text}
      maxLength={NL_SEARCH_MAX_TEXT_LENGTH}
      hideCount={text.length < NL_SEARCH_MAX_TEXT_LENGTH - 50}
      aria-describedby="{id}-nl-search-status"
      data-testid="{id}-nl-search-input"
    />
    <Badge
      colorScheme="warning"
      text={translate('common.experimental')}
      class="mx-2 hidden shrink-0 self-center sm:inline-flex"
    />
    <Button
      data-testid="{id}-nl-search-button"
      variant="ghost"
      type="submit"
      class="shrink-0 rounded-none focus-visible:z-20"
      {loading}
      disabled={!canSubmit}
    >
      {translate('workflows.nl-search-submit')}
    </Button>
  </form>
  <div
    class="flex items-center gap-2"
    class:border-t={!!statusMessage || !!$nlSearchTrace}
    class:border-primary={!!statusMessage || !!$nlSearchTrace}
  >
    <p
      id="{id}-nl-search-status"
      aria-live="polite"
      data-testid="{id}-nl-search-status"
      class="min-w-0 grow break-words px-3 py-1.5 text-sm"
      class:sr-only={!statusMessage}
      class:text-danger={status?.kind === 'error'}
      class:text-warning={status?.kind === 'hint'}
      class:text-secondary={loading || status?.kind === 'success'}
    >
      {statusMessage}
    </p>
    {#if $nlSearchTrace && !loading}
      <Button
        variant="ghost"
        size="xs"
        class="mr-1 shrink-0"
        aria-label={translate('workflows.nl-search-explain-label')}
        aria-expanded={$nlSearchTraceOpen}
        aria-controls="{id}-nl-search-trace"
        data-testid="{id}-nl-search-explain"
        onclick={() => ($nlSearchTraceOpen = !$nlSearchTraceOpen)}
      >
        {translate('workflows.nl-search-explain')}
      </Button>
    {/if}
  </div>
</div>

<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import { page } from '$app/state';

  import Accordion from '$lib/holocene/accordion/accordion.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    scheduleSearchAttributes,
    searchAttributes,
  } from '$lib/stores/search-attributes';
  import type { DescribeScheduleResponse } from '$lib/types';
  import { parsePayloadAttributes } from '$lib/utilities/decode-payload';
  import { payloadToString } from '$lib/utilities/payload-to-string';
  import { pluralize } from '$lib/utilities/pluralize';
  import {
    routeForSchedulesWithQuery,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';

  import { getSearchAttributeQuery } from '../utilities/get-search-attribute-query';

  type Props = {
    schedule: DescribeScheduleResponse;
  };
  let { schedule }: Props = $props();

  const scheduleAttributes = $derived(
    parsePayloadAttributes({
      searchAttributes: {
        indexedFields: { ...schedule?.searchAttributes?.indexedFields },
      },
    }).searchAttributes.indexedFields,
  );
  const workflowAttributes = $derived(
    parsePayloadAttributes({
      searchAttributes: {
        indexedFields: {
          ...schedule?.schedule?.action?.startWorkflow?.searchAttributes
            ?.indexedFields,
        },
      },
    }).searchAttributes.indexedFields,
  );
  const searchAttributeCount = $derived(
    Object.keys(scheduleAttributes).length +
      Object.keys(workflowAttributes).length,
  );
</script>

{#snippet attributes(
  kind: 'workflow' | 'schedule',
  indexedFields: typeof scheduleAttributes,
)}
  <ul class="w-full">
    {#each Object.entries(indexedFields) as [searchAttrName, searchAttrValue] (searchAttrName)}
      {@const query = getSearchAttributeQuery(
        searchAttrName,
        kind === 'schedule'
          ? $scheduleSearchAttributes[searchAttrName]
          : $searchAttributes[searchAttrName],
        searchAttrValue,
      )}
      <li class="flex flex-wrap items-center gap-2 py-2">
        <a
          href={query
            ? kind === 'schedule'
              ? routeForSchedulesWithQuery({
                  namespace: page.params.namespace,
                  query,
                })
              : routeForWorkflowsWithQuery({
                  namespace: page.params.namespace,
                  query,
                })
            : undefined}
          class="flex flex-wrap items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary"
        >
          <span class={twMerge('break-all', query && 'underline')}
            >{searchAttrName}</span
          >
          <span
            class="select-all rounded-sm bg-surface-tertiary p-1 leading-4 text-primary"
          >
            {payloadToString(searchAttrValue)}
          </span>
        </a>
      </li>
    {:else}
      <li class="flex min-h-10 items-center py-2 text-secondary">
        {translate('common.none')}
      </li>
    {/each}
  </ul>
{/snippet}

<Accordion
  class="rounded-lg"
  title={translate('events.custom-search-attributes')}
  subtitle={`${searchAttributeCount} ${translate('events.custom-search')} ${pluralize(
    translate('events.attribute'),
    searchAttributeCount,
  )}`}
>
  <div class="-mt-2 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
    <section aria-labelledby="schedule-attributes-heading" class="min-w-0">
      <h4 id="schedule-attributes-heading" class="mb-2 font-medium">
        {translate('schedules.schedule')}
      </h4>
      {@render attributes('schedule', scheduleAttributes)}
    </section>
    <section aria-labelledby="workflow-attributes-heading" class="min-w-0">
      <h4 id="workflow-attributes-heading" class="mb-2 font-medium">
        {translate('common.workflows-plural', { count: 1 })}
      </h4>
      {@render attributes('workflow', workflowAttributes)}
    </section>
  </div>
</Accordion>

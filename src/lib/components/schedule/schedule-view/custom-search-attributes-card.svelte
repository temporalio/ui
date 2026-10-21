<script lang="ts">
  import { page } from '$app/state';

  import Accordion from '$lib/holocene/accordion/accordion.svelte';
  import { translate } from '$lib/i18n/translate';
  import { scheduleSearchAttributes } from '$lib/stores/search-attributes';
  import type { DescribeFullSchedule } from '$lib/types/schedule';
  import { parsePayloadAttributes } from '$lib/utilities/decode-payload';
  import { pluralize } from '$lib/utilities/pluralize';
  import { routeForSchedulesWithQuery } from '$lib/utilities/route-for';

  import { scheduledActionPresentations } from '../scheduled-action-types/presentation-registry';
  import type { ResolvedScheduledAction } from '../scheduled-action-types/types';

  import SearchAttributesList from './search-attributes-list.svelte';

  type Props = {
    schedule: DescribeFullSchedule;
    resolvedAction: ResolvedScheduledAction;
  };
  let { schedule, resolvedAction }: Props = $props();

  const scheduleAttributes = $derived(
    parsePayloadAttributes({
      searchAttributes: {
        indexedFields: { ...schedule?.searchAttributes?.indexedFields },
      },
    }).searchAttributes.indexedFields,
  );
  const actionAttributeCount = $derived(
    resolvedAction.type !== 'unknown' && resolvedAction.isEditing
      ? scheduledActionPresentations[
          resolvedAction.type
        ].view.searchAttributes.getCount(resolvedAction)
      : 0,
  );
  const searchAttributeCount = $derived(
    Object.keys(scheduleAttributes).length + actionAttributeCount,
  );
</script>

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
      <SearchAttributesList
        attributes={scheduleAttributes}
        attributeTypes={$scheduleSearchAttributes}
        getHref={(query) =>
          routeForSchedulesWithQuery({
            namespace: page.params.namespace,
            query,
          })}
      />
    </section>
    {#if resolvedAction.type !== 'unknown' && resolvedAction.isEditing}
      {@const presentation = scheduledActionPresentations[resolvedAction.type]}
      <presentation.view.searchAttributes.Component
        {resolvedAction}
        namespace={page.params.namespace}
        scheduleId={schedule.schedule_id}
      />
    {/if}
  </div>
</Accordion>

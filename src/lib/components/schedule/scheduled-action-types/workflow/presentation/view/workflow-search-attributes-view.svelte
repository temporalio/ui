<script lang="ts">
  import SearchAttributesList from '$lib/components/schedule/schedule-view/search-attributes-list.svelte';
  import { translate } from '$lib/i18n/translate';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import { parsePayloadAttributes } from '$lib/utilities/decode-payload';
  import { routeForWorkflowsWithQuery } from '$lib/utilities/route-for';

  import type { ResolvedWorkflowAction } from '../../types';

  type Props = {
    resolvedAction: Extract<ResolvedWorkflowAction, { isEditing: true }>;
    namespace: string;
  };

  let { resolvedAction, namespace }: Props = $props();

  const attributes = $derived(
    parsePayloadAttributes({
      searchAttributes: {
        indexedFields: {
          ...resolvedAction.schedule.schedule.action.startWorkflow
            .searchAttributes?.indexedFields,
        },
      },
    }).searchAttributes.indexedFields,
  );
</script>

<div class="min-w-0">
  <h4 class="mb-2 font-medium">
    {translate('common.workflows-plural', { count: 1 })}
  </h4>
  <SearchAttributesList
    {attributes}
    attributeTypes={$searchAttributes}
    getHref={(query) => routeForWorkflowsWithQuery({ namespace, query })}
  />
</div>

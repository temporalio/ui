<script lang="ts">
  import type { Snippet } from 'svelte';

  import Card from '$lib/holocene/card.svelte';
  import { translate } from '$lib/i18n/translate';
  import Segment from '$lib/io/segmented-control/segment.svelte';
  import SegmentedControl from '$lib/io/segmented-control/segmented-control.svelte';

  import { scheduledActionPresentations } from '../scheduled-action-types/presentation-registry';
  import type { ScheduledActionType } from '../scheduled-action-types/types';

  interface Props {
    actionType: ScheduledActionType;
    onActionTypeChange: (type: ScheduledActionType) => void;
    disabled?: boolean;
    children: Snippet;
  }

  let {
    actionType,
    onActionTypeChange,
    disabled = false,
    children,
  }: Props = $props();

  const registeredActionPresentations = $derived(
    Object.values(scheduledActionPresentations),
  );
</script>

<Card class="w-full">
  <h2 class="text-2xl font-medium">
    {translate('schedules.execution-details-heading')}
  </h2>
  <div class="mt-4 flex flex-col gap-4">
    {#if registeredActionPresentations.length > 1}
      <fieldset>
        <legend class="mb-2 text-sm font-medium text-primary">
          {translate('schedules.execution-type-question')}<span
            aria-hidden="true"
            class="ml-1 font-mono leading-none text-static-danger">*</span
          >
        </legend>
        <SegmentedControl>
          {#each registeredActionPresentations as presentation (presentation.type)}
            <Segment
              id={`${presentation.type}-execution`}
              type="button"
              selected={presentation.type === actionType}
              aria-pressed={presentation.type === actionType}
              {disabled}
              onclick={() => onActionTypeChange(presentation.type)}
            >
              {presentation.label()}
            </Segment>
          {/each}
        </SegmentedControl>
      </fieldset>
    {/if}
    {@render children()}
  </div>
</Card>

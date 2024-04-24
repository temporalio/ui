<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { WorkflowTaskFailedEventAttributes } from '$lib/types';
  import type { WorkflowTaskFailedEvent } from '$lib/types/events';
  import type { WorkflowTaskFailedCause } from '$lib/types/workflows';
  import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';
  import { formatDate } from '$lib/utilities/format-date';
  import { getSingleAttributeForEvent } from '$lib/utilities/get-single-attribute-for-event';
  import { toWorkflowTaskFailureReadable } from '$lib/utilities/screaming-enums';

  import { CategoryIcon } from './constants';

  function getErrorCause(
    error: WorkflowTaskFailedEvent,
  ): WorkflowTaskFailedCause {
    const {
      workflowTaskFailedEventAttributes: { failure, cause },
    } = error as WorkflowTaskFailedEvent & {
      workflowTaskFailedEventAttributes: WorkflowTaskFailedEventAttributes;
    };

    if (
      failure?.applicationFailureInfo?.type === 'workflowTaskHeartbeatError'
    ) {
      return 'WorkflowTaskHeartbeatError';
    }

    return toWorkflowTaskFailureReadable(cause);
  }

  export let error: WorkflowTaskFailedEvent;

  let cause: WorkflowTaskFailedCause;
  $: {
    cause = getErrorCause(error);
  }
</script>

{#if cause}
  <Alert
    icon="warning"
    intent="warning"
    title={translate(`typed-errors.${cause}.title`)}
  >
    <p>
      {translate(`typed-errors.${cause}.description`)}
    </p>
    {#if cause === 'WorkflowWorkerUnhandledFailure' || cause === 'BadSearchAttributes'}
      <p>
        {translate('typed-errors.link-preface')}<Link
          newTab
          href={translate(`typed-errors.${cause}.link`)}
          >{translate(`typed-errors.${cause}.action`)}</Link
        >.
      </p>
    {/if}
    <div class="mt-2 flex flex-col gap-0">
      <div
        class="flex justify-between gap-2 border-2 border-red-500 bg-inverse px-2 py-1 text-white"
      >
        <div class="flex gap-2">
          {error.id}
          <Icon name={CategoryIcon[error.category]} />
          {spaceBetweenCapitalLetters(error?.name)}
        </div>
        {formatDate(error?.eventTime, $timeFormat, {
          relative: $relativeTime,
        })}
      </div>
      <div class="flex gap-2 bg-slate-500 px-2 py-1 text-white">
        {spaceBetweenCapitalLetters(getSingleAttributeForEvent(error).key)}
        {getSingleAttributeForEvent(error).value}
      </div>
    </div>
  </Alert>
{/if}

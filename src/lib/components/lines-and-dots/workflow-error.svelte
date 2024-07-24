<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { WorkflowTaskFailedEventAttributes } from '$lib/types';
  import type { WorkflowTaskFailedEvent } from '$lib/types/events';
  import type { WorkflowTaskFailedCause } from '$lib/types/workflows';
  import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';
  import { formatDate } from '$lib/utilities/format-date';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
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

    return toWorkflowTaskFailureReadable(cause || 'Unspecified');
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
    <div
      class="mt-2 flex w-full flex-col gap-0 overflow-hidden rounded-xl border-2 border-danger"
    >
      <div class="flex items-center justify-between gap-2 bg-danger px-2 py-1">
        <div class="flex items-center gap-2">
          {error.id}
          <Icon name={CategoryIcon[error.category]} />
          <span class="font-semibold text-danger"
            >{spaceBetweenCapitalLetters(error?.name)}</span
          >
        </div>
        {formatDate(error?.eventTime, $timeFormat, {
          relative: $relativeTime,
        })}
      </div>
      <div class="flex flex-col gap-2 bg-space-black p-4 text-white">
        <p>{translate('common.failure')}</p>
        <CodeBlock
          content={stringifyWithBigInt(
            error.attributes?.failure?.message || '',
          )}
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        />
        <p>{translate('common.stack-trace')}</p>
        <CodeBlock
          content={error.attributes?.failure?.stackTrace || ''}
          language="text"
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        />
        <p>{translate('common.source')}</p>
        <CodeBlock
          content={error.attributes?.failure?.source || ''}
          language="text"
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        />
      </div>
    </div>
  </Alert>
{/if}

<script lang="ts">
  import Badge, { type BadgeType } from '$lib/holocene/badge.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconTemporalActivity, IconTemporalWorkflow } from '$lib/io/icon';
  import {
    type BatchOperationActionType,
    BatchOperationExecutionType,
    type BatchOperationType,
  } from '$lib/types/batch';
  import { toBatchOperationTypeReadable } from '$lib/utilities/screaming-enums';

  interface Props {
    operationType?: BatchOperationType;
  }

  let { operationType }: Props = $props();

  // The API returns the raw screaming enum (e.g.
  // BATCH_OPERATION_TYPE_CANCEL_ACTIVITY) we want to derive
  // the execution type from the suffix
  const rawOperationType = $derived(String(operationType));

  const executionType: BatchOperationExecutionType | undefined = $derived.by(
    () => {
      if (
        rawOperationType === 'Unspecified' ||
        rawOperationType.endsWith('_UNSPECIFIED')
      )
        return undefined;
      if (/ACTIVITY/.test(rawOperationType))
        return BatchOperationExecutionType.Activity;
      return BatchOperationExecutionType.Workflow;
    },
  );

  const action = $derived(
    toBatchOperationTypeReadable(
      rawOperationType.replace(
        /_(ACTIVITY|WORKFLOW)$/,
        '',
      ) as BatchOperationType,
    ),
  );

  const operationTypeToBadgeType: Record<BatchOperationActionType, BadgeType> =
    {
      Terminate: 'warning',
      Cancel: 'default',
      Reset: 'primary',
      Signal: 'secondary',
      Delete: 'danger',
      Unspecified: 'default',
    };

  const Glyph = $derived(
    executionType === BatchOperationExecutionType.Activity
      ? IconTemporalActivity
      : IconTemporalWorkflow,
  );
</script>

<span class="flex items-center gap-2">
  {#if operationType}
    <Badge class="h-5" type={operationTypeToBadgeType[action]}>
      {action}
    </Badge>
    {#if executionType}
      <span class="flex items-center gap-1">
        <Glyph />
        {executionType === BatchOperationExecutionType.Activity
          ? translate('common.activities-plural', { count: 2 })
          : translate('common.workflows-plural', { count: 2 })}
      </span>
    {/if}
  {:else}
    -
  {/if}
</span>

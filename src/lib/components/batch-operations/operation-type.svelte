<script lang="ts">
  import Badge, { type BadgeType } from '$lib/holocene/badge.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type {
    BatchOperationActionType,
    BatchOperationExecutionType,
    BatchOperationType,
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
      if (rawOperationType.endsWith('_ACTIVITY')) return 'Activity';
      if (
        rawOperationType === 'Unspecified' ||
        rawOperationType.endsWith('_UNSPECIFIED')
      )
        return undefined;
      return 'Workflow';
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
</script>

<span class="flex items-center gap-2">
  {#if operationType}
    <Badge class="h-5" type={operationTypeToBadgeType[action]}>
      {action}
    </Badge>
    {#if executionType}
      <span class="flex items-center gap-1">
        <Icon name={executionType === 'Activity' ? 'activity' : 'workflow'} />
        {executionType}
      </span>
    {/if}
  {:else}
    -
  {/if}
</span>

<script lang="ts">
  import { writable } from 'svelte/store';

  import Modal from '$lib/holocene/modal.svelte';
  import RadioCard from '$lib/holocene/radio-input/radio-card.svelte';
  import RadioGroup from '$lib/holocene/radio-input/radio-group.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    actionPending,
    clearConfirmationModalActionTimeout,
    closeConfirmationModal,
    confirmationModal,
    serverError,
    submitTriggerImmediatelySchedule,
  } from '$lib/stores/schedules';
  import type { OverlapPolicy } from '$lib/types/schedule';
  import { getIdentity } from '$lib/utilities/core-context';

  import { getOverlapPolicyContent } from '../constants';

  interface Props {
    initialOverlapPolicy: OverlapPolicy;
    scheduleId: string;
    namespace: string;
  }

  const overlapPolicyContent = getOverlapPolicyContent();
  const identity = getIdentity();

  let { initialOverlapPolicy, scheduleId, namespace }: Props = $props();

  // svelte-ignore state_referenced_locally
  let selectedOverlapPolicy = writable<OverlapPolicy>(
    initialOverlapPolicy ?? 'Skip',
  );

  $effect(() => {
    return () => clearConfirmationModalActionTimeout('trigger');
  });
</script>

<Modal
  id="trigger-schedule-modal"
  large
  open={$confirmationModal === 'trigger'}
  confirmType="primary"
  confirmText={translate('schedules.trigger')}
  cancelText={translate('common.cancel')}
  loading={$actionPending}
  error={$serverError}
  on:confirmModal={() =>
    submitTriggerImmediatelySchedule($selectedOverlapPolicy, {
      identity,
      scheduleId,
      namespace,
    })}
  on:cancelModal={() => {
    closeConfirmationModal('trigger');
  }}
>
  <h3 slot="title">
    {translate('schedules.trigger-modal-title')}
  </h3>
  <div slot="content">
    <RadioGroup name="overlap-policy" group={selectedOverlapPolicy}>
      {#each Object.entries(overlapPolicyContent) as [value, content] (value)}
        <RadioCard
          id="overlap-policy-{value}"
          value={value as OverlapPolicy}
          label={[
            content.label,
            content.isDefault && translate('schedules.overlap-default-suffix'),
          ]
            .filter(Boolean)
            .join(' ')}
          description={content.description}
          labelContainerClass="border-transparent p-0"
        />
      {/each}
    </RadioGroup>
  </div>
</Modal>

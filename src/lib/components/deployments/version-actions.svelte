<script lang="ts">
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    deleteWorkerDeploymentVersion,
    removeRampingDeploymentVersion,
    setCurrentDeploymentVersion,
    setRampingDeploymentVersion,
    unsetCurrentDeploymentVersion,
    validateCurrentWorkerDeploymentVersionComputeConfig,
  } from '$lib/services/deployments-service';
  import { toaster } from '$lib/stores/toaster';
  import type { RoutingConfig } from '$lib/types/deployments';
  import {
    resolveValidationOutcome,
    type ValidationOutcome,
  } from '$lib/utilities/connection-status';

  import DeleteVersionModal from './delete-version-modal.svelte';
  import SetCurrentVersionModal from './set-current-version-modal.svelte';
  import SetRampingVersionModal from './set-ramping-version-modal.svelte';
  import ValidateConnectionModal from './validate-connection-modal.svelte';

  /**
   * The confirm modals behind a Version's actions, and the requests they make.
   * Whoever renders this owns where the modals sit in the DOM: a drawer
   * renders its own copy inside itself, so the modals stay reachable while the
   * rest of the page is inert.
   */
  interface Props {
    namespace: string;
    deploymentName: string;
    buildId: string;
    routingConfig: RoutingConfig;
    conflictToken?: string;
    /** False for a Version no Worker has polled yet. */
    canRamp: boolean;
    onChange?: () => void;
    onValidationComplete?: () => void;
    onDeleted?: () => void;
  }

  let {
    namespace,
    deploymentName,
    buildId,
    routingConfig,
    conflictToken,
    canRamp,
    onChange,
    onValidationComplete,
    onDeleted,
  }: Props = $props();

  const currentBuildId = $derived(
    routingConfig.currentDeploymentVersion?.buildId,
  );
  const rampingDeploymentName = $derived(
    routingConfig.rampingDeploymentVersion?.deploymentName,
  );
  const rampingBuildId = $derived(
    routingConfig.rampingDeploymentVersion?.buildId,
  );
  const isRamping = $derived(
    rampingDeploymentName === deploymentName && rampingBuildId === buildId,
  );
  const otherVersionRamping = $derived(
    rampingBuildId && !isRamping
      ? `${rampingDeploymentName}.${rampingBuildId}`
      : undefined,
  );

  let showSetCurrentModal = $state(false);
  let setCurrentError = $state('');
  let showUnsetCurrentModal = $state(false);
  let unsetCurrentError = $state('');
  let showDeleteVersionModal = $state(false);
  let deleteVersionError = $state('');
  let showValidateModal = $state(false);
  let validateLoading = $state(false);
  let validateResult = $state<ValidationOutcome | null>(null);
  let showSetRampingModal = $state(false);
  let setRampingError = $state('');
  let setRampingLoading = $state(false);
  let rampingPercentage = $state(0);

  const errorMessage = (err: unknown, fallback: string): string =>
    (err as { body?: { message?: string } })?.body?.message ?? fallback;

  export function setCurrent() {
    showSetCurrentModal = true;
  }

  export function unsetCurrent() {
    showUnsetCurrentModal = true;
  }

  export function remove() {
    showDeleteVersionModal = true;
  }

  export function setRamping() {
    rampingPercentage = isRamping
      ? (routingConfig.rampingVersionPercentage ?? 0)
      : 0;
    setRampingError = '';
    showSetRampingModal = true;
  }

  export async function validate() {
    if (validateLoading) return;

    validateResult = null;
    validateLoading = true;
    showValidateModal = true;
    try {
      let outcome: ValidationOutcome | undefined;
      await validateCurrentWorkerDeploymentVersionComputeConfig(
        { namespace, deploymentName, buildId },
        (error) => {
          outcome = resolveValidationOutcome(error);
        },
      );
      validateResult = outcome ?? { state: 'valid' };
    } catch {
      // A request that never returned tells us nothing about the connection.
      validateResult = { state: 'indeterminate' };
    } finally {
      validateLoading = false;
    }

    // A completed check persists the connection status, and a check that did
    // not return to us can still finish, so refresh for every outcome.
    onValidationComplete?.();
  }

  async function handleSetCurrentVersion() {
    setCurrentError = '';
    await setCurrentDeploymentVersion(
      { namespace, deploymentName, buildId },
      (err) => {
        setCurrentError = errorMessage(
          err,
          translate('deployments.set-as-current-error'),
        );
      },
    );
    if (setCurrentError) return;
    showSetCurrentModal = false;
    toaster.push({
      variant: 'primary',
      message: translate('deployments.set-current-version-success', {
        buildId,
      }),
    });
    onChange?.();
  }

  async function handleUnsetCurrentVersion() {
    unsetCurrentError = '';
    await unsetCurrentDeploymentVersion(
      { namespace, deploymentName, conflictToken },
      (err) => {
        unsetCurrentError = errorMessage(
          err,
          translate('deployments.unset-current-error'),
        );
      },
    );
    if (unsetCurrentError) return;
    showUnsetCurrentModal = false;
    onChange?.();
  }

  async function handleSetRamping() {
    setRampingError = '';
    setRampingLoading = true;
    try {
      await setRampingDeploymentVersion(
        {
          namespace,
          deploymentName,
          buildId,
          rampingVersionPercentage: rampingPercentage,
          conflictToken,
        },
        (err) => {
          setRampingError = errorMessage(
            err,
            translate('deployments.set-ramping-error'),
          );
        },
      );
    } finally {
      setRampingLoading = false;
    }
    if (setRampingError) return;
    showSetRampingModal = false;
    toaster.push({
      variant: 'primary',
      message: translate('deployments.set-ramping-success', {
        buildId,
        percentage: rampingPercentage,
      }),
    });
    onChange?.();
  }

  async function handleRemoveRamping() {
    setRampingError = '';
    setRampingLoading = true;
    try {
      await removeRampingDeploymentVersion(
        { namespace, deploymentName, conflictToken },
        (err) => {
          setRampingError = errorMessage(
            err,
            translate('deployments.remove-ramping-error'),
          );
        },
      );
    } finally {
      setRampingLoading = false;
    }
    if (setRampingError) return;
    showSetRampingModal = false;
    toaster.push({
      variant: 'primary',
      message: translate('deployments.remove-ramping-success', { buildId }),
    });
    onChange?.();
  }

  async function handleDeleteVersion() {
    deleteVersionError = '';
    await deleteWorkerDeploymentVersion(
      { namespace, deploymentName, buildId, conflictToken },
      (err) => {
        deleteVersionError = errorMessage(
          err,
          translate('deployments.delete-version-error'),
        );
      },
    );
    if (deleteVersionError) return;
    showDeleteVersionModal = false;
    onDeleted?.();
    onChange?.();
  }
</script>

<SetCurrentVersionModal
  {buildId}
  {currentBuildId}
  {deploymentName}
  open={showSetCurrentModal}
  error={setCurrentError}
  onConfirm={handleSetCurrentVersion}
  onCancel={() => {
    showSetCurrentModal = false;
    setCurrentError = '';
  }}
/>

<SetRampingVersionModal
  {buildId}
  {deploymentName}
  open={showSetRampingModal}
  error={setRampingError}
  loading={setRampingLoading}
  hasActivePollers={canRamp}
  {isRamping}
  existingRampingVersion={otherVersionRamping}
  existingRampingPercentage={routingConfig.rampingVersionPercentage}
  currentPercentage={isRamping
    ? (routingConfig.rampingVersionPercentage ?? undefined)
    : undefined}
  bind:percentage={rampingPercentage}
  onConfirm={handleSetRamping}
  onRemove={handleRemoveRamping}
  onCancel={() => {
    showSetRampingModal = false;
    setRampingError = '';
  }}
/>

<ValidateConnectionModal
  {buildId}
  bind:open={showValidateModal}
  loading={validateLoading}
  result={validateResult}
  onClose={() => (showValidateModal = false)}
  onRetry={validate}
/>

<DeleteVersionModal
  {buildId}
  open={showDeleteVersionModal}
  error={deleteVersionError}
  onConfirm={handleDeleteVersion}
  onCancel={() => {
    showDeleteVersionModal = false;
    deleteVersionError = '';
  }}
/>

<Modal
  id="unset-current-version-modal"
  open={showUnsetCurrentModal}
  confirmText={translate('common.confirm')}
  cancelText={translate('common.cancel')}
  onConfirmModal={handleUnsetCurrentVersion}
  onCancelModal={() => {
    showUnsetCurrentModal = false;
    unsetCurrentError = '';
  }}
>
  {#snippet titleSnippet()}
    <h3>{translate('deployments.unset-current')}</h3>
  {/snippet}
  {#snippet content()}
    <div class="flex flex-col gap-4">
      <p class="text-sm">
        {translate('deployments.unset-current-description')}
      </p>
      {#if unsetCurrentError}
        <p class="text-sm text-danger">{unsetCurrentError}</p>
      {/if}
    </div>
  {/snippet}
</Modal>

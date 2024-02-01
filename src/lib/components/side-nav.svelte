<script lang="ts">
  import { onDestroy } from 'svelte';

  import FeatureGuard from '$lib/components/feature-guard.svelte';
  import IsCloudGuard from '$lib/components/is-cloud-guard.svelte';
  import IsLegacyCloudGuard from '$lib/components/is-legacy-cloud-guard.svelte';
  import NavContainer from '$lib/holocene/navigation/nav-container.svelte';
  import NavRow from '$lib/holocene/navigation/nav-row.svelte';
  import { translate } from '$lib/i18n/translate';
  import { inProgressBatchOperation } from '$lib/stores/batch-operations';

  import type { DescribeNamespaceResponse as Namespace } from '$types';

  export let isCloud = false;
  export let activeNamespace: Namespace;
  export let linkList: Partial<Record<string, string>>;

  let batchOperationIcon: 'layers-1' | 'layers-2' | 'layers-3' = 'layers-3';

  const interval = setInterval(() => {
    if (!$inProgressBatchOperation) {
      batchOperationIcon = 'layers-3';
      return;
    }

    setTimeout(() => {
      batchOperationIcon = 'layers-1';
    });

    setTimeout(() => {
      batchOperationIcon = 'layers-2';
    }, 330);

    setTimeout(() => {
      batchOperationIcon = 'layers-3';
    }, 660);
  }, 2000);

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<NavContainer {isCloud} {linkList} aria-label={translate('common.primary')}>
  <svelte:fragment slot="top">
    <NavRow
      link={linkList.workflows}
      data-testid="workflows-button"
      label={translate('common.workflows')}
      icon="workflow"
    />
    <IsCloudGuard {isCloud}>
      <FeatureGuard
        enabled={Boolean(activeNamespace?.namespaceInfo?.supportsSchedules)}
      >
        <NavRow
          link={linkList.schedules}
          data-testid="schedules-button"
          label={translate('common.schedules')}
          icon="schedules"
        />
      </FeatureGuard>
    </IsCloudGuard>
    <slot name="top" />
    <IsCloudGuard {isCloud}>
      <NavRow
        link={linkList.archive}
        data-testid="archive-button"
        label={translate('common.archive')}
        icon="archives"
      />
    </IsCloudGuard>
    <NavRow
      link={linkList.batchOperations}
      label={translate('batch.nav-title')}
      tooltip={translate('batch.list-page-title')}
      icon={batchOperationIcon}
    />
  </svelte:fragment>
  <svelte:fragment slot="middle">
    <IsLegacyCloudGuard {isCloud}>
      <NavRow
        link={linkList.namespaces}
        data-testid="namespaces-button"
        label={translate('common.namespaces')}
        icon="namespace"
      />
    </IsLegacyCloudGuard>
    <slot name="middle" />
  </svelte:fragment>
  <svelte:fragment slot="bottom">
    <slot name="bottom" />
    <slot name="import">
      <IsCloudGuard {isCloud}>
        <NavRow
          link={linkList.import}
          data-testid="import-button"
          label={translate('common.import')}
          icon="import"
        />
      </IsCloudGuard>
    </slot>
    <slot name="feedback">
      <NavRow
        link={linkList.feedback}
        label={translate('common.feedback')}
        icon="feedback"
      />
    </slot>
  </svelte:fragment>
</NavContainer>

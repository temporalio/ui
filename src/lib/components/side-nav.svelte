<script lang="ts">
  import FeatureGuard from '$lib/components/feature-guard.svelte';
  import IsCloudGuard from '$lib/components/is-cloud-guard.svelte';
  import IsLegacyCloudGuard from '$lib/components/is-legacy-cloud-guard.svelte';
  import LabsModeGuard from '$lib/holocene/labs-mode-guard.svelte';
  import NavigationButton from '$lib/holocene/navigation/navigation-button.svelte';
  import Navigation from '$lib/holocene/navigation/navigation-container.svelte';
  import NavigationItem from '$lib/holocene/navigation/navigation-item.svelte';
  import { translate } from '$lib/i18n/translate';
  import { inProgressBatchOperation } from '$lib/stores/batch-operations';
  import { labsMode } from '$lib/stores/labs-mode';
  import { useDarkMode } from '$lib/utilities/dark-mode';

  import type { DescribeNamespaceResponse as Namespace } from '$types';

  export let isCloud = false;
  export let activeNamespace: Namespace;
  export let linkList: Partial<Record<string, string>>;

  $: labsHoverText = `${translate('common.labs')} ${
    $labsMode
      ? `${translate('common.on')} - ${translate('common.experimental')}`
      : translate('common.off')
  }`;
  $: labsText = `${translate('common.labs')} ${
    $labsMode ? translate('common.on') : translate('common.off')
  }`;
</script>

<Navigation {isCloud} {linkList} aria-label={translate('common.primary')}>
  <svelte:fragment slot="top">
    <NavigationItem
      link={linkList.workflows}
      data-testid="workflows-button"
      label={translate('common.workflows')}
      icon="workflow"
    />
    <IsCloudGuard {isCloud}>
      <FeatureGuard
        enabled={Boolean(activeNamespace?.namespaceInfo?.supportsSchedules)}
      >
        <NavigationItem
          link={linkList.schedules}
          data-testid="schedules-button"
          label={translate('common.schedules')}
          icon="schedules"
        />
      </FeatureGuard>
    </IsCloudGuard>
    <slot name="top" />
    <IsCloudGuard {isCloud}>
      <NavigationItem
        link={linkList.archive}
        data-testid="archive-button"
        label={translate('common.archive')}
        icon="archives"
      />
    </IsCloudGuard>
    <NavigationItem
      link={linkList.batchOperations}
      label={translate('batch.nav-title')}
      tooltip={translate('batch.list-page-title')}
      icon="batch-operation"
      animate={!!$inProgressBatchOperation}
    />
  </svelte:fragment>
  <svelte:fragment slot="middle">
    <IsLegacyCloudGuard {isCloud}>
      <NavigationItem
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
        <NavigationItem
          link={linkList.import}
          data-testid="import-button"
          label={translate('common.import')}
          icon="import"
        />
      </IsCloudGuard>
    </slot>
    <slot name="feedback">
      <NavigationItem
        link={linkList.feedback}
        label={translate('common.feedback')}
        icon="feedback"
        external
      />
      <NavigationButton
        onClick={() => ($labsMode = !$labsMode)}
        tooltip={labsHoverText}
        label={labsText}
        icon="labs"
        active={$labsMode}
        data-testid="labs-mode-button"
      />
      <LabsModeGuard>
        <NavigationButton
          onClick={() => ($useDarkMode = !$useDarkMode)}
          tooltip={$useDarkMode
            ? translate('common.day')
            : translate('common.night')}
          label={$useDarkMode
            ? translate('common.day')
            : translate('common.night')}
          icon={$useDarkMode ? 'sun' : 'moon'}
        />
      </LabsModeGuard>
    </slot>
  </svelte:fragment>
</Navigation>

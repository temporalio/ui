<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { DescribeNamespaceResponse as Namespace } from '$types';

  import NavContainer from '$lib/holocene/navigation/nav-container.svelte';
  import NavRow from '$lib/holocene/navigation/nav-row.svelte';
  import NavTooltip from '$lib/holocene/navigation/nav-tooltip.svelte';
  import IsCloudGuard from '$lib/components/is-cloud-guard.svelte';
  import FeatureGuard from '$lib/components/feature-guard.svelte';
  import IsLegacyCloudGuard from '$lib/components/is-legacy-cloud-guard.svelte';
  import { translate } from '$lib/i18n/translate';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { labsMode } from '$lib/stores/labs-mode';

  export let isCloud = false;
  export let activeNamespace: Namespace;
  export let linkList: Partial<Record<string, string>>;

  $: labsText = `${translate('labs')} ${
    $labsMode ? translate('on') : translate('off')
  }`;
</script>

<NavContainer {isCloud} {linkList}>
  <svelte:fragment slot="top">
    <NavRow link={linkList.workflows} {isCloud} data-testid="workflows-button">
      <NavTooltip right text={translate('workflows')}>
        <div class="nav-icon">
          <Icon name="workflow" />
        </div>
      </NavTooltip>
      <div class="nav-title">{translate('workflows')}</div>
    </NavRow>
    <IsCloudGuard {isCloud}>
      <FeatureGuard
        enabled={Boolean(activeNamespace?.namespaceInfo?.supportsSchedules)}
      >
        <NavRow
          link={linkList.schedules}
          {isCloud}
          data-testid="schedules-button"
        >
          <NavTooltip right text={translate('schedules')}>
            <div class="nav-icon">
              <Icon name="schedules" />
            </div>
          </NavTooltip>
          <div class="nav-title">{translate('schedules')}</div>
        </NavRow>
      </FeatureGuard>
    </IsCloudGuard>
    <slot name="top" />
    <IsCloudGuard {isCloud}>
      <NavRow link={linkList.archive} {isCloud} data-testid="archive-button">
        <NavTooltip right text={translate('archive')}>
          <div class="nav-icon">
            <Icon name="archives" />
          </div>
        </NavTooltip>
        <div class="nav-title">{translate('archive')}</div>
      </NavRow>
    </IsCloudGuard>
  </svelte:fragment>
  <svelte:fragment slot="middle">
    <IsLegacyCloudGuard {isCloud}>
      <NavRow
        link={linkList.namespaces}
        {isCloud}
        data-testid="namespaces-button"
      >
        <NavTooltip right text={translate('namespaces')}>
          <div class="nav-icon">
            <Icon name="namespace" />
          </div>
        </NavTooltip>
        <div class="nav-title">{translate('namespaces')}</div>
      </NavRow>
    </IsLegacyCloudGuard>
    <slot name="middle" />
  </svelte:fragment>
  <svelte:fragment slot="bottom">
    <slot name="bottom" />
    <slot name="import">
      <IsCloudGuard {isCloud}>
        <NavRow link={linkList.import} {isCloud} data-testid="import-button">
          <NavTooltip right text={translate('import')}>
            <div class="nav-icon">
              <Icon name="import" />
            </div>
          </NavTooltip>
          <div class="nav-title">{translate('import')}</div>
        </NavRow>
      </IsCloudGuard>
    </slot>
    <slot name="feedback">
      <NavRow link={linkList.feedback} {isCloud} externalLink>
        <NavTooltip right text={translate('feedback')}>
          <div class="nav-icon">
            <Icon name="feedback" />
          </div>
        </NavTooltip>
        <div class="nav-title">{translate('feedback')}</div>
      </NavRow>
    </slot>
    <NavRow {isCloud} noHover>
      <NavTooltip right text={labsText}>
        <button
          aria-label="labs mode"
          data-testid="labs-button"
          class="w-10 flex items-center justify-center"
          on:click={() => ($labsMode = !$labsMode)}
        >
          <Icon name="labs" {isCloud} active={$labsMode} />
        </button>
      </NavTooltip>
      <div class="nav-title">
        {labsText}
      </div>
    </NavRow>
  </svelte:fragment>
</NavContainer>

<style lang="postcss">
  .nav-icon {
    @apply ml-2 mr-2 mt-0 h-6 cursor-pointer;
  }

  .nav-title {
    width: 100px;
    overflow: hidden;
    transition: width 0.15s linear;
  }
</style>

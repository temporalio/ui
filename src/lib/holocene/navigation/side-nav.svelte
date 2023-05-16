<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { DescribeNamespaceResponse as Namespace } from '$types';

  import NavContainer from '$lib/holocene/navigation/nav-container.svelte';
  import NavRow from '$lib/holocene/navigation/nav-row.svelte';
  import NavTooltip from '$lib/holocene/nav-tooltip.svelte';
  import IsCloudGuard from '$lib/components/is-cloud-guard.svelte';

  import FeatureGuard from '$lib/components/feature-guard.svelte';
  import IsLegacyCloudGuard from '$lib/components/is-legacy-cloud-guard.svelte';

  export let isCloud = false;
  export let activeNamespace: Namespace;
  export let linkList: Partial<Record<string, string>>;
</script>

<NavContainer {isCloud} {linkList}>
  <svelte:fragment slot="top">
    <NavRow link={linkList.workflows} {isCloud} data-testid="workflows-button">
      <NavTooltip right text="Workflows">
        <div class="nav-icon">
          <Icon name="workflow" />
        </div>
      </NavTooltip>
      <div class="nav-title">Workflows</div>
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
          <NavTooltip right text="Schedules">
            <div class="nav-icon">
              <Icon name="schedules" />
            </div>
          </NavTooltip>
          <div class="nav-title">Schedules</div>
        </NavRow>
      </FeatureGuard>
    </IsCloudGuard>
    <slot name="top" />
    <IsCloudGuard {isCloud}>
      <NavRow link={linkList.archive} {isCloud} data-testid="archive-button">
        <NavTooltip right text="Archive">
          <div class="nav-icon">
            <Icon name="archives" />
          </div>
        </NavTooltip>
        <div class="nav-title">Archive</div>
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
        <NavTooltip right text="Namespaces">
          <div class="nav-icon">
            <Icon name="namespace" />
          </div>
        </NavTooltip>
        <div class="nav-title">Namespaces</div>
      </NavRow>
    </IsLegacyCloudGuard>
    <slot name="middle" />
  </svelte:fragment>
  <svelte:fragment slot="bottom">
    <slot name="bottom" />
    <slot name="import">
      <IsCloudGuard {isCloud}>
        <NavRow link={linkList.import} {isCloud} data-testid="import-button">
          <NavTooltip right text="Import">
            <div class="nav-icon">
              <Icon name="import" />
            </div>
          </NavTooltip>
          <div class="nav-title">Import</div>
        </NavRow>
      </IsCloudGuard>
    </slot>
    <slot name="feedback">
      <NavRow link={linkList.feedback} {isCloud} externalLink>
        <NavTooltip right text="Feedback">
          <div class="nav-icon">
            <Icon name="feedback" />
          </div>
        </NavTooltip>
        <div class="nav-title">Feedback</div>
      </NavRow>
    </slot>
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

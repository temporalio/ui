<script lang="ts" context="module">
  export interface ExtraIcon {
    component: typeof SvelteComponent;
    name: string;
    onClick?: () => void;
  }
</script>

<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { SvelteComponent } from 'svelte';
  import type { DescribeNamespaceResponse as Namespace } from '$types';

  import { namespaceSelectorOpen } from '$lib/stores/nav-open';

  import NavContainer from '$lib/holocene/navigation/nav-container.svelte';
  import NavRow from '$lib/holocene/navigation/nav-row.svelte';
  import NamespaceList from '$lib/components/namespace-list.svelte';
  import Drawer from '$lib/holocene/navigation/drawer.svelte';
  import NavTooltip from '$lib/holocene/nav-tooltip.svelte';
  import IsCloudGuard from '$lib/components/is-cloud-guard.svelte';

  import { afterNavigate } from '$app/navigation';
  import FeatureGuard from '$lib/components/feature-guard.svelte';
  import IsLegacyCloudGuard from '$lib/components/is-legacy-cloud-guard.svelte';

  export let isCloud = false;
  export let activeNamespace: Namespace;
  export let getNamespaceList: () => Promise<NamespaceItem[]>;
  export let linkList: Partial<Record<string, string>>;
  export let user: Promise<User> | undefined;
  export let logout: () => void;
  export let extras: ExtraIcon[] | null = null;

  let showProfilePic = true;

  function fixImage() {
    showProfilePic = false;
  }

  afterNavigate(() => {
    if ($namespaceSelectorOpen) {
      $namespaceSelectorOpen = false;
    }
  });
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
    <slot name="schedules">
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
    </slot>
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
    <slot name="usage" />
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
  <svelte:fragment slot="bottom">
    {#if extras}
      {#each extras as extra}
        <NavRow {isCloud} noFilter handleClick={extra.onClick}>
          <svelte:component this={extra.component}>
            <div class="nav-title">
              {extra.name}
            </div>
          </svelte:component>
        </NavRow>
      {/each}
    {/if}
    <slot name="feedback">
      <!-- <NavRow link={linkList.feedback} {isCloud} externalLink>
        <NavTooltip right text="Feedback">
          <div class="nav-icon">
            <Icon name="feedback" />
          </div>
        </NavTooltip>
        <div class="nav-title">Feedback</div>
      </NavRow> -->
    </slot>
    <slot name="settings" />
  </svelte:fragment>
  <svelte:fragment slot="drawer">
    <!-- <Drawer
      flyin={$namespaceSelectorOpen === true}
      flyout={$namespaceSelectorOpen === false}
      onClose={() => {
        if ($namespaceSelectorOpen === true) $namespaceSelectorOpen = false;
      }}
    >
      {#if $namespaceSelectorOpen}
        <NamespaceList
          {getNamespaceList}
          on:closeNamespaceList={() => {
            $namespaceSelectorOpen = false;
          }}
        />
      {/if}
    </Drawer> -->
  </svelte:fragment>
</NavContainer>

<style lang="postcss">
  .nav-icon {
    @apply ml-2 mr-2 mt-0 h-6 cursor-pointer;
  }

  .cursor {
    @apply cursor-pointer;
  }

  .nav-title {
    width: 100px;
    overflow: hidden;
    transition: width 0.15s linear;
  }

  .profile-row {
    @apply ml-1 flex flex-row items-center rounded-lg py-1 text-sm font-medium;
  }
</style>

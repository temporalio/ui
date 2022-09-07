<script context="module"></script>

<script>import Icon from '$holocene/icon/icon.svelte';
import FeatureTag from '../feature-tag.svelte';
import { namespaceSelectorOpen } from '../../stores/nav-open';
import NavContainer from './_nav-container.svelte';
import NavRow from './_nav-row.svelte';
import NamespaceList from '../../components/namespace-list.svelte';
import Drawer from './_drawer.svelte';
import NavTooltip from '../nav-tooltip.svelte';
import IsCloudGuard from '../../components/is-cloud-guard.svelte';
import { afterNavigate } from '$app/navigation';
import { viewFeature } from '../../stores/new-feature-tags';
import FeatureGuard from '../../components/feature-guard.svelte';
export let isCloud = false;
export let activeNamespace;
export let getNamespaceList;
export let linkList;
export let user;
export let logout;
export let extras = null;
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
    <NavRow link={linkList.workflows} {isCloud} data-cy="workflows-button">
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
          data-cy="schedules-button"
          on:click={() => viewFeature('schedules')}
        >
          <NavTooltip right text="Schedules">
            <div class="nav-icon">
              <Icon name="schedules" />
              <FeatureTag feature="schedules" alpha />
            </div>
          </NavTooltip>
          <div class="nav-title">Schedules</div>
        </NavRow>
      </FeatureGuard>
    </IsCloudGuard>
    <IsCloudGuard>
      <NavRow link={linkList.namespaces} {isCloud} data-cy="namespaces-button">
        <NavTooltip right text="Namespaces">
          <div class="nav-icon">
            <Icon name="namespace" />
          </div>
        </NavTooltip>
        <div class="nav-title">Namespaces</div>
      </NavRow>
    </IsCloudGuard>
    <slot name="usage" />
    <IsCloudGuard {isCloud}>
      <NavRow link={linkList.archive} {isCloud} data-cy="archive-button">
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
        <NavRow {isCloud} noFilter>
          <div class="nav-icon">
            <svelte:component this={extra.component} />
          </div>
          <div class="nav-title">
            {extra.name}
          </div>
        </NavRow>
      {/each}
    {/if}
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
    <slot name="settings" />
    {#await user}
      <NavRow {isCloud}>
        <div class="motion-safe:animate-pulse" style="margin-left:1rem">
          <div class="rounded-full bg-blueGray-200 h-full aspect-square" />
        </div>
        <div class="nav-title">
          <div class="h-2 bg-blueGray-50 rounded mt-1" />
        </div>
      </NavRow>
    {:then user}
      {#if user?.email}
        <NavRow {isCloud} on:click={logout}>
          <NavTooltip right text="Logout">
            <div class="nav-icon">
              <Icon name="logout" />
            </div>
          </NavTooltip>
          <div class="nav-title cursor-pointer">Logout</div>
        </NavRow>
        <div class="profile-row">
          <div>
            {#if user?.picture}
              <img
                src={user?.picture}
                alt={user?.profile}
                class="rounded-md p-1 w-8 h-8"
                on:error={fixImage}
                class:hidden={!showProfilePic}
              />
              <div
                class="rounded-full p-0.5 bg-blue-200 h-full aspect-square"
                class:hidden={showProfilePic}
              >
                {#if user?.name}
                  <div class="text-black text-center ">
                    {user?.name.trim().charAt(0)}
                  </div>
                {/if}
              </div>
            {/if}
          </div>
          <div class="nav-title truncate">
            {#if user?.name}
              {user?.name}
            {/if}
          </div>
        </div>
      {/if}
    {/await}
  </svelte:fragment>
  <svelte:fragment slot="drawer">
    <Drawer
      flyin={$namespaceSelectorOpen === true}
      flyout={$namespaceSelectorOpen === false}
      onClose={() => {
        if ($namespaceSelectorOpen === true) $namespaceSelectorOpen = false;
      }}
    >
      {#if $namespaceSelectorOpen}
        <NamespaceList
          {getNamespaceList}
          on:closeNamespaceList={(event) => {
            $namespaceSelectorOpen = false;
          }}
        />
      {/if}
    </Drawer>
  </svelte:fragment>
</NavContainer>

<style>
  .nav-icon {
    margin-left: 0.5rem;
    margin-right: 0.5rem;
    margin-top: 0px;
    height: 1.5rem;
    cursor: pointer;
}
  .nav-title {
    width: 100px;
    overflow: hidden;
    transition: width 0.25s linear;
    -webkit-transition: width 0.25s linear;
  }
  .profile-row {
    margin-left: 0.25rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    border-radius: 0.5rem;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 500;
}</style>

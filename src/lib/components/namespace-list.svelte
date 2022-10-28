<script lang="ts">
  import { page } from '$app/stores';
  import { createEventDispatcher } from 'svelte';
  import { onMount } from 'svelte';

  import Icon from '$holocene/icon/icon.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Loading from '$lib/holocene/loading.svelte';

  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { workflowSorts, workflowFilters } from '$lib/stores/filters';
  import { goto } from '$app/navigation';
  import {
    routeForWorkflows,
    routeForSchedules,
  } from '$lib/utilities/route-for';
  import { fetchNamespaces } from '$lib/services/namespaces-service';

  import type { DescribeNamespaceResponse as Namespace } from '$types';
  import type { ListNamespacesResponse } from '$types';

  let searchField: HTMLInputElement = null;
  const {
    showTemporalSystemNamespace,
    runtimeEnvironment: { isCloud },
  } = $page.stuff.settings;

  const namespacesPromise: Promise<ListNamespacesResponse> = fetchNamespaces(
    $page.stuff.settings,
  );

  function getCurrentHref(namespace: string) {
    const onSchedulesPage = $page.url.pathname.endsWith('schedules');
    const href = onSchedulesPage
      ? routeForSchedules({ namespace })
      : routeForWorkflows({ namespace });
    return href;
  }

  function getNamespaceList(namespaces: Namespace[]) {
    const filteredNamespaces: string[] = namespaces
      .map((namespace: Namespace) => namespace?.namespaceInfo?.name)
      .filter(
        (namespace: string) =>
          showTemporalSystemNamespace || namespace !== 'temporal-system',
      );
    let namespaceList = filteredNamespaces.map((namespace: string) => {
      return {
        namespace,
        href: (namespace: string) => getCurrentHref(namespace),
        onClick: (namespace: string) => {
          $lastUsedNamespace = namespace;
          $workflowFilters = [];
          $workflowSorts = [];
          goto(getCurrentHref(namespace));
        },
      };
    });

    // To show single namespace on cloud
    if (isCloud && $page.params.namespace && !filteredNamespaces.length) {
      namespaceList.push({
        namespace: $page.params.namespace,
        href: (namespace: string) => routeForWorkflows({ namespace }),
        onClick: (namespace: string) => {
          $lastUsedNamespace = $page.params.namespace;
          $workflowFilters = [];
          $workflowSorts = [];
          goto(routeForWorkflows({ namespace }));
        },
      });
    }
    return namespaceList;
  }

  onMount(() => {
    searchField.focus();
  });
  const dispatch = createEventDispatcher();

  /** When a user presses escape close the namespace switcher  */
  export function rootDocumentHandler(node: Element): { destroy: () => void } {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (node && !event.defaultPrevented) {
        if (event.key === 'Escape') {
          dispatch('closeNamespaceList');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return {
      destroy() {
        document.removeEventListener('keydown', handleKeyDown, true);
      },
    };
  }

  $: searchValue = '';
</script>

<div class="prose mt-16 mb-8">
  <h2 class="text-2xl">Select a namespace</h2>
  {#if $page.params?.namespace}
    <p>You are currently viewing {$page.params.namespace}</p>
  {/if}
</div>

<div class="mb-5 flex rounded-full border p-1 pr-4">
  <div class="ml-4 mr-2">
    <Icon name="search" />
  </div>
  <input
    class="w-full"
    placeholder="Search"
    use:rootDocumentHandler
    bind:value={searchValue}
    bind:this={searchField}
  />
</div>

<ul data-cy="namespace-list">
  {#await namespacesPromise}
    <Loading />
  {:then namespacesResult}
    {@const namespaceList = getNamespaceList(namespacesResult.namespaces)}
    {#if namespaceList.length > 0}
      {#each namespaceList.filter( ({ namespace }) => namespace.includes(searchValue), ) as namespace}
        <li
          class="first:rounded-t-md first:border-t last:rounded-b-md border-b border-l border-r p-3 flex border-collapse gap-2 hover:bg-gray-50 cursor-pointer"
          on:click={() => namespace?.onClick(namespace.namespace)}
        >
          <div class="w-6 h-6 pl-3 active">
            {#if namespace.namespace === $page.params?.namespace}
              <Icon name="checkmark" />
            {/if}
          </div>
          <a
            href={namespace.href(namespace.namespace)}
            class="link"
            class:active={namespace.namespace === $page.params?.namespace}
            >{namespace.namespace}</a
          >
        </li>
      {:else}
        <EmptyState title="No Namespaces" />
      {/each}
    {:else}
      <EmptyState title="Could not list Namespaces" />
    {/if}
  {/await}
</ul>

<style lang="postcss">
  .link {
    @apply ml-2 truncate text-gray-900;
  }

  .link:hover {
    @apply underline;
  }
</style>

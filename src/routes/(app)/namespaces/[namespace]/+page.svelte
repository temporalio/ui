<script lang="ts">
  import type { PageData } from './$types';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  import { temporalVersion, uiVersion } from '$lib/stores/versions';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import { settings } from '$lib/stores/settings';

  import { fromSecondsToDaysOrHours } from '$lib/utilities/format-time';

  import Card from '$lib/holocene/card.svelte';
  import PageTitle from '$lib/components/page-title.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Badge, { type BadgeType } from '$lib/holocene/badge.svelte';

  export let data: PageData;

  enum ArchivalState {
    ARCHIVAL_STATE_UNSPECIFIED = 0,
    ARCHIVAL_STATE_DISABLED = 1,
    ARCHIVAL_STATE_ENABLED = 2,
  }

  const badgeTypeForArchivalState = (state: ArchivalState): BadgeType => {
    return state === ArchivalState.ARCHIVAL_STATE_ENABLED ? 'green' : 'default';
  };

  const badgeTypeForBoolean = (
    bool: boolean,
    invertLogic: boolean = true,
  ): BadgeType => {
    if (invertLogic) {
      return bool ? 'default' : 'green';
    }

    return bool ? 'green' : 'default';
  };

  const badgeTextForBoolean = (bool: boolean): 'Enabled' | 'Disabled' => {
    return bool ? 'Disabled' : 'Enabled';
  };

  $: ({ namespace, clusters } = data);

  onMount(() => {
    $lastUsedNamespace = namespace?.namespaceInfo?.name;
  });
</script>

<PageTitle
  title={`Namespaces | ${namespace?.namespaceInfo?.name}`}
  url={$page.url.href}
/>
<h1 class="text-2xl" data-testid="namespace-title">
  Namespace: {namespace?.namespaceInfo?.name}
</h1>
<h2 data-testid="namespace-description">
  {namespace?.namespaceInfo?.description}
</h2>
<Card class="flex flex-col gap-4 lg:flex-row">
  <article class="namespace-info flex w-full flex-col">
    <h3 class="text-lg font-medium">Details</h3>
    <Table variant="simple">
      <tr slot="headers">
        <th class="w-1/2 lg:w-3/5" /><th />
      </tr>
      <tr data-testid="namespace-owner">
        <td>Owner</td>
        <td>{namespace?.namespaceInfo?.ownerEmail || 'Unknown'}</td>
      </tr>
      <tr data-testid="namespace-global">
        <td>Global</td>
        <td>
          <Badge
            class="px-1 py-0"
            type={badgeTypeForBoolean(namespace?.isGlobalNamespace, false)}
          >
            {namespace?.isGlobalNamespace ? 'Yes' : 'No'}
          </Badge>
        </td>
      </tr>
      <tr data-testid="namespace-retention">
        <td>Retention Period</td>
        <td
          >{fromSecondsToDaysOrHours(
            namespace?.config?.workflowExecutionRetentionTtl.toString(),
          )}</td
        >
      </tr>
      <tr data-testid="namespace-history">
        <td>History Archival</td>
        <td
          ><Badge
            class="px-1 py-0"
            type={badgeTypeForArchivalState(
              namespace?.config?.historyArchivalState,
            )}
          >
            {namespace?.config?.historyArchivalState}
          </Badge></td
        >
      </tr>
      <tr data-testid="namespace-visibility">
        <td>Visibility Archival</td>
        <td
          ><Badge
            class="px-1 py-0"
            type={badgeTypeForArchivalState(
              namespace?.config?.visibilityArchivalState,
            )}
          >
            {namespace?.config?.visibilityArchivalState}
          </Badge></td
        >
      </tr>
      <tr data-testid="namespace-failover">
        <td>Failover Version</td>
        <td>{namespace?.failoverVersion}</td>
      </tr>
      <tr data-testid="namespace-clusters">
        <td>Clusters</td>
        <td>{clusters}</td>
      </tr>
    </Table>
  </article>

  <article class="namespace-info flex w-full flex-col">
    <h3 class="text-lg font-medium">Versions</h3>
    <Table variant="simple">
      <tr slot="headers">
        <th class="w-1/2 lg:w-3/4" /><th />
      </tr>

      <tr data-testid="server-version">
        <td>Temporal Server Version</td>
        <td>{$temporalVersion}</td>
      </tr>
      <tr data-testid="ui-version">
        <td>Temporal UI Version</td>
        <td>{$uiVersion}</td>
      </tr>
    </Table>
  </article>

  <article class="namespace-info flex w-full flex-col">
    <h3 class="text-lg font-medium">Client Actions</h3>
    <Table variant="simple">
      <tr slot="headers">
        <th class="w-1/2 lg:w-3/5" /><th />
      </tr>

      <tr>
        <td>Client Actions</td>
        <td
          ><Badge
            class="px-1 py-0"
            type={badgeTypeForBoolean($settings.disableWriteActions)}
            >{badgeTextForBoolean($settings.disableWriteActions)}</Badge
          ></td
        >
      </tr>
      <tr>
        <td>Terminate Workflow</td>
        <td
          ><Badge
            class="px-1 py-0"
            type={badgeTypeForBoolean($settings.workflowTerminateDisabled)}
            >{badgeTextForBoolean($settings.workflowTerminateDisabled)}</Badge
          ></td
        >
      </tr>
      <tr>
        <td>Cancel Workflow</td>
        <td
          ><Badge
            class="px-1 py-0"
            type={badgeTypeForBoolean($settings.workflowCancelDisabled)}
            >{badgeTextForBoolean($settings.workflowCancelDisabled)}</Badge
          ></td
        >
      </tr>
      <tr>
        <td>Signal Workflow</td>
        <td
          ><Badge
            class="px-1 py-0"
            type={badgeTypeForBoolean($settings.workflowSignalDisabled)}
            >{badgeTextForBoolean($settings.workflowSignalDisabled)}</Badge
          ></td
        >
      </tr>
      <tr>
        <td>Reset Workflow</td>
        <td
          ><Badge
            class="px-1 py-0"
            type={badgeTypeForBoolean($settings.workflowResetDisabled)}
            >{badgeTextForBoolean($settings.workflowResetDisabled)}</Badge
          ></td
        >
      </tr>
    </Table>
  </article>
</Card>

{#if $searchAttributes}
  <section>
    <h3 class="my-4 text-lg font-medium">Search Attributes</h3>
    <Table class="w-full">
      <TableHeaderRow slot="headers">
        <th>Key</th>
        <th>Type</th>
      </TableHeaderRow>
      {#each Object.entries($searchAttributes) as [key, type]}
        <TableRow>
          <td>{key}</td>
          <td>{type}</td>
        </TableRow>
      {/each}
    </Table>
  </section>
{/if}

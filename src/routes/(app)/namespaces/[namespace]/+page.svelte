<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/stores';

  import type { PageData } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import Badge, { type BadgeType } from '$lib/holocene/badge.svelte';
  import Card from '$lib/holocene/card.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import { settings } from '$lib/stores/settings';
  import { temporalVersion, uiVersion } from '$lib/stores/versions';
  import { fromSecondsToDaysOrHours } from '$lib/utilities/format-time';

  export let data: PageData;

  enum ArchivalState {
    ARCHIVAL_STATE_UNSPECIFIED = 0,
    ARCHIVAL_STATE_DISABLED = 1,
    ARCHIVAL_STATE_ENABLED = 2,
  }

  const badgeTypeForArchivalState = (state: ArchivalState): BadgeType => {
    return state === ArchivalState.ARCHIVAL_STATE_ENABLED
      ? 'success'
      : undefined;
  };

  const badgeTypeForBoolean = (
    bool: boolean,
    invertLogic = true,
  ): BadgeType => {
    if (invertLogic) {
      return bool ? undefined : 'success';
    }

    return bool ? 'success' : undefined;
  };

  const badgeTextForBoolean = (bool: boolean) => {
    return bool ? translate('common.disabled') : translate('common.enabled');
  };

  $: ({ namespace, clusters } = data);

  onMount(() => {
    $lastUsedNamespace = namespace?.namespaceInfo?.name;
  });
</script>

<PageTitle
  title={`${translate('namespaces.namespace')} | ${
    namespace?.namespaceInfo?.name
  }`}
  url={$page.url.href}
/>
<h1 data-testid="namespace-title">
  {translate('namespaces.namespace')}: {namespace?.namespaceInfo?.name}
</h1>
<h2 data-testid="namespace-description">
  {namespace?.namespaceInfo?.description || ''}
</h2>
<Card class="flex flex-col gap-4 lg:flex-row">
  <article class="namespace-info flex w-full flex-col">
    <h3>{translate('common.details')}</h3>
    <Table variant="simple">
      <caption class="sr-only" slot="caption"
        >{`${translate('namespaces.namespace')} ${translate(
          'common.details',
        )}`}</caption
      >
      <tr slot="headers">
        <th class="w-1/2 lg:w-3/5"></th><th></th>
      </tr>
      <tr data-testid="namespace-owner">
        <td>{translate('namespaces.owner')}</td>
        <td
          >{namespace?.namespaceInfo?.ownerEmail ||
            translate('common.unknown')}</td
        >
      </tr>
      <tr data-testid="namespace-global">
        <td>{translate('namespaces.global')}</td>
        <td>
          <Badge
            class="px-1 py-0"
            type={badgeTypeForBoolean(namespace?.isGlobalNamespace, false)}
          >
            {namespace?.isGlobalNamespace
              ? translate('common.yes')
              : translate('common.no')}
          </Badge>
        </td>
      </tr>
      <tr data-testid="namespace-retention">
        <td>{translate('namespaces.retention-period')}</td>
        <td
          >{fromSecondsToDaysOrHours(
            namespace?.config?.workflowExecutionRetentionTtl.toString(),
          )}</td
        >
      </tr>
      <tr data-testid="namespace-history">
        <td>{translate('namespaces.history-archival')}</td>
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
        <td>{translate('namespaces.visibility-archival')}</td>
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
        <td>{translate('namespaces.failover-version')}</td>
        <td>{namespace?.failoverVersion || ''}</td>
      </tr>
      <tr data-testid="namespace-clusters">
        <td>{translate('namespaces.clusters')}</td>
        <td>{clusters}</td>
      </tr>
    </Table>
  </article>

  <article class="namespace-info flex w-full flex-col">
    <h3>{translate('namespaces.versions')}</h3>
    <Table variant="simple">
      <caption class="sr-only" slot="caption"
        >{translate('namespaces.versions')}</caption
      >
      <tr slot="headers">
        <th class="w-1/2 lg:w-3/4"></th><th></th>
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
    <h3>
      {translate('namespaces.client-actions')}
    </h3>
    <Table variant="simple">
      <caption class="sr-only" slot="caption"
        >{translate('namespaces.client-actions')}</caption
      >

      <tr slot="headers">
        <th class="w-1/2 lg:w-3/5"></th><th></th>
      </tr>

      <tr>
        <td>{translate('namespaces.client-actions')}</td>
        <td
          ><Badge
            class="px-1 py-0"
            type={badgeTypeForBoolean($settings.disableWriteActions)}
            >{badgeTextForBoolean($settings.disableWriteActions)}</Badge
          ></td
        >
      </tr>
      <tr>
        <td>{translate('workflows.terminate-modal-title')}</td>
        <td
          ><Badge
            class="px-1 py-0"
            type={badgeTypeForBoolean($settings.workflowTerminateDisabled)}
            >{badgeTextForBoolean($settings.workflowTerminateDisabled)}</Badge
          ></td
        >
      </tr>
      <tr>
        <td>{translate('workflows.cancel-modal-title')}</td>
        <td
          ><Badge
            class="px-1 py-0"
            type={badgeTypeForBoolean($settings.workflowCancelDisabled)}
            >{badgeTextForBoolean($settings.workflowCancelDisabled)}</Badge
          ></td
        >
      </tr>
      <tr>
        <td>{translate('namespaces.signal-workflow')}</td>
        <td
          ><Badge
            class="px-1 py-0"
            type={badgeTypeForBoolean($settings.workflowSignalDisabled)}
            >{badgeTextForBoolean($settings.workflowSignalDisabled)}</Badge
          ></td
        >
      </tr>
      <tr>
        <td>{translate('workflows.reset-modal-title')}</td>
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
    <h3 class="my-4">
      {translate('events.attribute-group.search-attributes')}
    </h3>
    <Table class="w-full">
      <caption class="sr-only" slot="caption"
        >{translate('events.attribute-group.search-attributes')}</caption
      >
      <TableHeaderRow slot="headers">
        <th>{translate('common.key')}</th>
        <th>{translate('common.type')}</th>
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

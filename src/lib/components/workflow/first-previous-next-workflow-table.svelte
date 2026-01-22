<script lang="ts">
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { routeForTimeline } from '$lib/utilities/route-for';

  export let workflow: string;
  export let namespace: string;

  export let first: string;
  export let next: string;
  export let previous: string;
</script>

<Table class="w-full">
  <caption class="sr-only" slot="caption"
    >{translate('workflows.relationships')}</caption
  >
  <TableHeaderRow slot="headers">
    <th>{translate('workflows.first-execution')}</th>
    <th>{translate('workflows.previous-execution')}</th>
    <th>{translate('workflows.next-execution')}</th>
  </TableHeaderRow>
  <TableRow>
    <td class="w-1/3">
      {#if first}
        <Link
          href={routeForTimeline({
            namespace,
            workflow: workflow,
            run: first,
          })}
        >
          <Copyable
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
            content={first}
            visible
          />
        </Link>
      {/if}
    </td>
    <td class="w-1/3">
      {#if previous}
        <Link
          href={routeForTimeline({
            namespace,
            workflow: workflow,
            run: previous,
          })}
        >
          <Copyable
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
            content={previous}
            visible
          />
        </Link>
      {/if}
    </td>
    <td class="w-1/3">
      {#if next}
        <Link
          href={routeForTimeline({
            namespace,
            workflow: workflow,
            run: next,
          })}
        >
          <Copyable
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
            content={next}
            visible
          />
        </Link>
      {/if}
    </td>
  </TableRow>
</Table>

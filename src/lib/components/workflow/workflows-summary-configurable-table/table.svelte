<script lang="ts">
  import Loading from '$lib/holocene/loading.svelte';
  import ProgressBar from '$lib/holocene/progress-bar.svelte';
  import type { WorkflowHeader } from '$lib/stores/workflow-table-columns';
  import { loading, updating } from '$lib/stores/workflows';

  export let pinned = false;
  export let columns: WorkflowHeader[];
</script>

<table class="workflows-summary-table" class:pinned>
  <thead>
    <slot name="headers" />
    {#if $updating}
      <ProgressBar />
    {/if}
  </thead>
  <tbody>
    {#if !pinned && ($loading || $updating)}
      <tr>
        <td colspan={columns.length + 1}>
          <Loading />
        </td>
      </tr>
    {:else}
      <slot />
    {/if}
  </tbody>
</table>

<style lang="postcss">
  .workflows-summary-table {
    @apply table-fixed w-auto;

    &:not(.pinned) {
      @apply table-auto w-full;
    }
  }
</style>

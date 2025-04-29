<script lang="ts">
  import Loading from '$lib/holocene/loading.svelte';
  import ProgressBar from '$lib/holocene/progress-bar.svelte';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import { loading, updating } from '$lib/stores/workflows';

  export let pinned = false;
  export let columns: ConfigurableTableHeader[];
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
  @reference "tailwindcss";

  .workflows-summary-table {
    @apply w-auto table-fixed;

    &:not(.pinned) {
      @apply w-full table-auto;
    }
  }
</style>

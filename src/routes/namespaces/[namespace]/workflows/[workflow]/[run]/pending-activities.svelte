<script lang="ts">
  import { page } from '$app/stores';
  import CodeBlock from '$lib/components/code-block.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';
  import Link from '$lib/components/link.svelte';

  import { format } from '$lib/utilities/format-camel-case';
  import { shouldDisplayAttribute } from '$lib/utilities/get-single-attribute-for-event';

  const { pendingActivities } = $page.stuff.workflow;
</script>

{#if pendingActivities.length}
  <section class="mb-6 event-table">
    <header class="p-2 border-gray-900 bg-gray-900 text-white  w-full">
      <h2>Pending Activities</h2>
    </header>
    {#each pendingActivities as { id, activityId, ...details } (id)}
      <article
        class="flex gap-4 p-4 items-start last-of-type:border-b-0 border-b-2 border-gray-600"
      >
        <div {id} class="py-1 w-12">
          <Link href="#{id}" class="block py-1">{activityId}</Link>
        </div>
        <table class="w-full">
          {#each Object.entries(details) as [key, value] (key)}
            <tr class="xl:table-row">
              <td>
                {#if shouldDisplayAttribute(key, value)}
                  <div class="border-b-2 border-gray-200 py-2">
                    {#if typeof value === 'object'}
                      <h2>
                        {format(key)}
                      </h2>
                      <CodeBlock
                        content={value}
                        class="w-full text-right pb-2"
                      />
                    {:else}
                      <div
                        class="flex justify-between md:justify-start items-center gap-4"
                      >
                        <h2>{format(key)}</h2>
                        <p class="text-sm text-right xl:text-left ">
                          <span class="px-2 bg-gray-300 select-all"
                            >{value}</span
                          >
                        </p>
                      </div>
                    {/if}
                  </div>
                {/if}
              </td>
            </tr>
          {/each}
        </table>
      </article>
    {/each}
  </section>
{:else}
  <EmptyState title="No Pending Activities" />
{/if}

<style lang="postcss">
  .event-table {
    @apply xl:table table-fixed border-gray-900 border-2 rounded-lg w-full;
  }

  .table-header-row {
    @apply bg-gray-900 text-gray-100 px-3;
  }

  .table-header-row-responsive {
    @apply flex xl:hidden bg-gray-900 text-gray-100 px-3 justify-end;
  }

  .table-header {
    @apply xl:table-cell text-left p-2 flex;
  }

  .table-header-responsive {
    @apply p-2 flex items-center;
  }

  .detail-row {
    @apply block xl:flex items-start gap-4 w-full border-b-2 border-gray-200 pb-2;
  }
  .row:last-of-type .detail-row {
    @apply border-b-0;
  }
  .badge {
    @apply text-gray-700 bg-gray-300;
  }
</style>

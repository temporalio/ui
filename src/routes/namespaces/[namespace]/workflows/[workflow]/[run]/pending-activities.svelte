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
  <section class="event-table mb-6">
    <header class="w-full border-gray-900 bg-gray-900 p-2  text-white">
      <h2>Pending Activities</h2>
    </header>
    {#each pendingActivities as { id, activityId, ...details } (id)}
      <article
        class="flex items-start gap-4 border-b-2 border-gray-600 p-4 last-of-type:border-b-0"
      >
        <div {id} class="w-12 py-1">
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
                        class="w-full pb-2 text-right"
                      />
                    {:else}
                      <div
                        class="flex items-center justify-between gap-4 md:justify-start"
                      >
                        <h2>{format(key)}</h2>
                        <p class="text-right text-sm xl:text-left ">
                          <span class="select-all bg-gray-300 px-2"
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
    @apply w-full table-fixed rounded-lg border-2 border-gray-900 xl:table;
  }
</style>

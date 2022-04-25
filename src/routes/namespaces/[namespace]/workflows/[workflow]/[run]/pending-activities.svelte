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
  <section class="border-2 border-gray-900 rounded-lg w-full mb-6">
    <header class="table-header">
      <h3>Pending Activities</h3>
    </header>
    <div>
      {#each pendingActivities as { id, activityId, ...details } (id)}
        <article class="flex gap-4">
          <div {id} class="p-4">
            <Link href="#{id}" class="block py-1">{activityId}</Link>
          </div>
          <div class="p-4 w-full">
            {#each Object.entries(details) as [key, value] (key)}
              {#if shouldDisplayAttribute(key, value)}
                <article
                  class="flex items-start content-start w-full border-b-2 last:border-b-0 border-gray-200 py-1"
                >
                  <h4 class="w-full flex-grow">{format(key)}</h4>
                  <div class="flex-grow w-full">
                    {#if typeof value === 'object'}
                      <CodeBlock content={value} />
                    {:else}
                      <p>
                        <span class="bg-gray-300 text-gray-700 px-2 select-all"
                          >{value}</span
                        >
                      </p>
                    {/if}
                  </div>
                </article>
              {/if}
            {/each}
          </div>
        </article>
      {/each}
    </div>
  </section>
{:else}
  <EmptyState title="No Pending Activities" />
{/if}

<style lang="postcss">
  .table-header {
    @apply bg-gray-900 text-white p-4 flex justify-between items-center border-b-2 border-gray-900;
  }
</style>

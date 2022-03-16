<script lang="ts">
  import { page } from '$app/stores';
  import CodeBlock from '$lib/components/code-block.svelte';

  import { format } from '$lib/utilities/format-camel-case';

  const { pendingActivities } = $page.stuff.workflow;
</script>

<section class="border-2 border-gray-300 rounded-lg w-full mb-6">
  <header class="table-header rounded-t-lg">
    <h3>Pending Activities</h3>
  </header>
  <div>
    {#each pendingActivities as { id, activityId, ...details }}
      <article class="flex gap-4">
        <div {id} class="p-4">
          <a href={id} class="block py-1">{activityId}</a>
        </div>
        <div class="p-4 w-full">
          {#each Object.entries(details) as [key, value] (key)}
            <article
              class="flex items-start content-start w-full border-b-2 last:border-b-0 border-gray-200 py-1"
            >
              <h4 class="w-full flex-grow">{format(key)}</h4>
              <div class="flex-grow w-full">
                {#if typeof value === 'object'}
                  <CodeBlock content={value} />
                {:else}
                  <p>
                    <span class="bg-gray-300 text-gray-700 px-2">{value}</span>
                  </p>
                {/if}
              </div>
            </article>
          {/each}
        </div>
      </article>
    {/each}
  </div>
</section>

<style lang="postcss">
  .table-header {
    @apply bg-gray-100 text-gray-800 font-semibold p-4 flex justify-between items-center border-b-2;
  }
</style>

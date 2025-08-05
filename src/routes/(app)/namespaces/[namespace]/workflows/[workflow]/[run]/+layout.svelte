<script lang="ts">
  import { onDestroy } from 'svelte';

  import { DetailListValue } from '$lib/components/detail-list';
  import Badge from '$lib/holocene/badge.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import WorkflowRunLayout from '$lib/layouts/workflow-run-layout.svelte';
  import { clearPreviousEventParameters } from '$lib/stores/previous-events';

  onDestroy(() => {
    clearPreviousEventParameters();
  });

  // Mock namespace tags data
  const mockNamespaceTags = [
    { key: 'Environment', value: 'Production' },
    { key: 'Application', value: 'Checkout' },
    { key: 'Team', value: 'Small' },
  ];
</script>

<WorkflowRunLayout>
  {#snippet additionalDetails()}
    <div class="flex gap-2">
      <DetailListValue>
        <div class="flex flex-wrap gap-2">
          {#each mockNamespaceTags as tag}
            <div
              class="inline-flex"
              role="img"
              aria-label="Tag: {tag.key} equals {tag.value}"
            >
              <Badge
                class="inline-flex items-center gap-1 rounded-r-none border-r-0 bg-blue-100 text-xs dark:bg-indigo-700 dark:text-white"
              >
                <Icon name="tag" class="h-3 w-3" />
                {tag.key}
              </Badge>
              <Badge
                class="inline-flex items-center rounded-l-none bg-blue-200 text-xs dark:bg-indigo-800 dark:text-white"
              >
                {tag.value}
              </Badge>
            </div>
          {/each}
        </div>
      </DetailListValue>
    </div>
  {/snippet}

  <slot />
</WorkflowRunLayout>

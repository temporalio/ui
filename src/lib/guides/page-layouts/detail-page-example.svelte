<script lang="ts">
  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import TabPanel from '$lib/holocene/tab/tab-panel.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import { Badge } from '$lib/io/badge';
  import { BadgeStatus } from '$lib/io/badge-status';
  import { Button } from '$lib/io/button';
  import { Chip } from '$lib/io/chip';
  import { IconAwsColor, IconChevronLeft } from '$lib/io/icon';
  import { PageHeader } from '$lib/io/layouts/page-header';
  import { Segment, SegmentedControl } from '$lib/io/segmented-control';
  import { Tag } from '$lib/io/tag';
  import { TextLink } from '$lib/io/text-link';

  let loading = $state(false);
</script>

<div class="flex w-full flex-col gap-6">
  <SegmentedControl aria-label="Page state">
    <Segment
      selected={!loading}
      aria-pressed={!loading}
      onclick={() => (loading = false)}
    >
      Loaded
    </Segment>
    <Segment
      selected={loading}
      aria-pressed={loading}
      onclick={() => (loading = true)}
    >
      Loading
    </Segment>
  </SegmentedControl>

  <div class="flex flex-col gap-4 border border-primary p-4">
    <div>
      <TextLink href="#workflows" LeadingIcon={IconChevronLeft}>
        Back to Workflows
      </TextLink>
    </div>

    {#if loading}
      <!-- Keep the layout steady while the record loads. -->
      <div class="flex flex-col gap-3" aria-busy="true">
        <Skeleton class="h-8 w-64" />
        <Skeleton class="h-6 w-96 max-w-full" />
      </div>
    {:else}
      <PageHeader>
        {#snippet leading()}
          <BadgeStatus status="Running" />
        {/snippet}
        {#snippet heading()}
          order-4821
        {/snippet}
        {#snippet tags()}
          <Tag text="team" extension={{ text: 'payments' }} />
        {/snippet}
        {#snippet description()}
          OrderWorkflow · Started Oct 16, 2026, 14:32 UTC
        {/snippet}
        {#snippet actions()}
          <Button colorScheme="secondary" size="sm">Signal</Button>
          <Button colorScheme="danger" size="sm">Terminate</Button>
        {/snippet}
        {#snippet metadata()}
          <Chip
            text="region"
            Icon={IconAwsColor}
            extension={{ text: 'us-west-2' }}
          />
        {/snippet}
      </PageHeader>
    {/if}

    <Tabs>
      <TabList label="Workflow sections">
        <Tab
          id="guide-tab-history"
          panelId="guide-panel-history"
          label="History"
        />
        <Tab
          id="guide-tab-workers"
          panelId="guide-panel-workers"
          label="Workers"
        >
          <Badge text="2" colorScheme="info" />
        </Tab>
        <Tab
          id="guide-tab-queries"
          panelId="guide-panel-queries"
          label="Queries"
        />
      </TabList>
      <div class="pt-4 text-sm text-secondary">
        <TabPanel id="guide-panel-history" tabId="guide-tab-history">
          Event history for this run.
        </TabPanel>
        <TabPanel id="guide-panel-workers" tabId="guide-tab-workers">
          Workers polling this run's task queue.
        </TabPanel>
        <TabPanel id="guide-panel-queries" tabId="guide-tab-queries">
          Query handlers and their results.
        </TabPanel>
      </div>
    </Tabs>
  </div>
</div>

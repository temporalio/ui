<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import usage from './tabs.usage.md?raw';

  import Tab from './tab.svelte';

  const { Story } = defineMeta({
    title: 'IO/Components/Tabs',
    tags: ['autodocs'],
    component: Tab,
    args: {
      count: 0,
    },
    argTypes: {
      count: {
        control: 'number',
        description: 'Shown in a badge after the label, including zero.',
      },
      disabled: { table: { disable: true } },
      children: {
        control: false,
        description: 'The tab label.',
        table: { category: 'properties', type: { summary: 'Snippet' } },
      },
      class: { table: { disable: true } },
    },
    parameters: {
      docs: {
        description: {
          component:
            'Tabs that switch between panels of content on the same page, and tab-styled links that change the URL.',
        },
        usage,
      },
      layout: 'padded',
    },
  });
</script>

<script lang="ts">
  import TabBar from './tab-bar.svelte';
  import TabLinkBar from './tab-link-bar.svelte';
  import TabLink from './tab-link.svelte';
  import TabPanel from './tab-panel.svelte';
  import Tabs from './tabs.svelte';

  let currentPage = $state('history');

  const tabs = ['history', 'workers', 'relationships', 'callbacks', 'archived'];
  const labels: Record<string, string> = {
    history: 'History',
    workers: 'Workers',
    relationships: 'Relationships',
    callbacks: 'Callbacks',
    archived: 'Archived',
  };
  const counts: Record<string, number | undefined> = {
    history: 12,
    workers: 2,
    relationships: 0,
  };

  const states = ['default', 'hover', 'focus', 'disabled'];
</script>

<Story name="Default">
  {#snippet template()}
    <div class="bg-background-primary p-6 text-primary">
      <Tabs {tabs} isTabDisabled={(tab) => tab === 'archived'}>
        <TabBar aria-label="Workflow views">
          {#snippet tabSnippet({ tab, getAttributes })}
            <Tab {...getAttributes()} count={counts[tab]}>{labels[tab]}</Tab>
          {/snippet}
        </TabBar>
        {#each tabs as tab (tab)}
          <TabPanel {tab} class="py-4 text-sm text-secondary">
            {labels[tab]} content
          </TabPanel>
        {/each}
      </Tabs>
    </div>
  {/snippet}
</Story>

<Story name="Links">
  {#snippet template()}
    <div class="bg-background-primary p-6 text-primary">
      <TabLinkBar aria-label="Workflow pages">
        {#each tabs as page (page)}
          <TabLink
            href={`#${page}`}
            current={currentPage === page}
            count={counts[page]}
            onclick={(event) => {
              event.preventDefault();
              currentPage = page;
            }}>{labels[page]}</TabLink
          >
        {/each}
      </TabLinkBar>
    </div>
  {/snippet}
</Story>

<Story name="States">
  {#snippet template()}
    <div class="overflow-x-auto bg-background-primary p-6 text-primary">
      <table class="border-separate border-spacing-4">
        <thead>
          <tr>
            <th scope="col" class="text-left text-xs text-secondary"></th>
            {#each states as state (state)}
              <th scope="col" class="text-left text-xs text-secondary">
                {state}
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each [false, true] as isCurrent (isCurrent)}
            <tr>
              <th scope="row" class="text-left text-xs text-secondary">
                {isCurrent ? 'current' : 'not current'}
              </th>
              {#each states as state (state)}
                <td>
                  <Tab
                    role="tab"
                    aria-selected={isCurrent}
                    aria-disabled={state === 'disabled' || undefined}
                    data-state={state}
                    count={0}>Tab</Tab
                  >
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/snippet}
</Story>

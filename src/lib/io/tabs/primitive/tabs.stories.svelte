<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { fn } from 'storybook/test';

  import usage from './tabs.usage.md?raw';

  import Tabs from './tabs.svelte';

  const { Story } = defineMeta({
    title: 'IO/Components/Tabs/Primitive',
    tags: ['autodocs'],
    component: Tabs,
    parameters: {
      docs: {
        description: {
          component:
            'Unstyled tabs that handle ARIA roles, selection and keyboard navigation.',
        },
        usage,
      },
    },
    args: {
      onSelectedTabChange: fn(),
    },
    argTypes: {
      tabs: { table: { disable: true } },
      selectedTab: { table: { disable: true } },
      children: { table: { disable: true } },
      onSelectedTabChange: { table: { disable: true } },
    },
  });
</script>

<script lang="ts">
  import type { TabsActivation, TabsOrientation } from './context';

  import TabBar from './tab-bar.svelte';
  import TabPanel from './tab-panel.svelte';

  const tabs = ['tab-a', 'tab-b', 'tab-c', 'tab-d'];
</script>

{#snippet example(
  orientation: TabsOrientation,
  activation: TabsActivation,
  disabledTabs: string[] = [],
)}
  <Tabs
    {tabs}
    {orientation}
    {activation}
    isTabDisabled={(tab) => disabledTabs.includes(tab)}
  >
    <div class={orientation === 'vertical' ? 'flex gap-4' : ''}>
      <TabBar
        class={orientation === 'vertical'
          ? 'flex flex-col gap-2'
          : 'flex gap-2'}
        aria-label="Example tabs"
      >
        {#snippet tabSnippet({ tab, isSelected, isDisabled, getAttributes })}
          <button
            type="button"
            {...getAttributes({
              class: `cursor-pointer rounded-md border px-3 py-1.5 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary ${
                isSelected
                  ? 'border-interactive-primary bg-interactive-primary text-white'
                  : 'border-tertiary bg-surface-primary text-primary hover:bg-interactive-tertiary-hover'
              } ${isDisabled ? 'cursor-not-allowed opacity-disabled' : ''}`,
            })}
          >
            {tab}
          </button>
        {/snippet}
      </TabBar>
      {#each tabs as tab (tab)}
        <TabPanel
          {tab}
          class="mt-4 rounded-md border border-tertiary p-4 text-sm text-primary"
        >
          {tab} content
        </TabPanel>
      {/each}
    </div>
  </Tabs>
{/snippet}

<Story name="Default">
  {#snippet template()}
    {@render example('horizontal', 'automatic')}
  {/snippet}
</Story>

<Story name="Vertical">
  {#snippet template()}
    {@render example('vertical', 'automatic')}
  {/snippet}
</Story>

<Story name="Manual Activation">
  {#snippet template()}
    {@render example('horizontal', 'manual')}
  {/snippet}
</Story>

<Story name="Disabled Tab">
  {#snippet template()}
    {@render example('horizontal', 'automatic', ['tab-c'])}
  {/snippet}
</Story>

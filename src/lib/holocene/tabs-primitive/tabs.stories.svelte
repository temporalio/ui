<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { fn } from 'storybook/test';

  import Tabs from '$lib/holocene/tabs-primitive/tabs.svelte';

  const { Story } = defineMeta({
    title: 'Tabs (Primitive)',
    component: Tabs,
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
  import TabButtonList from './tab-button-list.svelte';
  import TabPanels from './tab-panels.svelte';

  const tabs = ['tab-a', 'tab-b', 'tab-c'];
</script>

{#snippet example(
  orientation: 'horizontal' | 'vertical',
  activation: 'automatic' | 'manual',
)}
  <Tabs {tabs}>
    <TabButtonList
      class={orientation === 'vertical' ? 'flex flex-col gap-2' : 'flex gap-2'}
      aria-label="Example tabs"
      {orientation}
      {activation}
    >
      {#snippet tabButtonSnippet(getAttributes, { tab, isSelected })}
        <button
          type="button"
          {...getAttributes({
            class: `cursor-pointer rounded-md border px-3 py-1.5 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary ${
              isSelected
                ? 'border-interactive-primary bg-interactive-primary text-white'
                : 'border-tertiary bg-surface-primary text-primary hover:bg-action-hover-overlay'
            }`,
          })}
        >
          {tab}
        </button>
      {/snippet}
    </TabButtonList>
    <TabPanels>
      {#snippet tabPanelSnippet(getAttributes, { tab })}
        <div
          {...getAttributes({
            class:
              'mt-4 rounded-md border border-tertiary p-4 text-sm text-primary',
          })}
        >
          {tab} content
        </div>
      {/snippet}
    </TabPanels>
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

<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import { IconAdd } from '$lib/io/icon';

  import SegmentLink from './segment-link.svelte';
  import Segment from './segment.svelte';
  import SegmentedControl from './segmented-control.svelte';

  const states = ['default', 'hover', 'focus', 'disabled'];

  const { Story } = defineMeta({
    title: 'IO/Components/Segmented Control',
    component: Segment,
    args: {
      selected: false,
      disabled: false,
      isLoading: false,
      count: 0,
    },
    argTypes: {
      selected: { control: 'boolean' },
      disabled: { control: 'boolean' },
      isLoading: { control: 'boolean' },
      count: { control: 'number' },
      Icon: {
        control: 'select',
        options: ['None', 'Add'],
        mapping: { None: undefined, Add: IconAdd },
      },
      children: { control: false },
      class: { table: { disable: true } },
    },
    parameters: { layout: 'padded' },
  });
</script>

<script lang="ts">
  let selectedSegment = $state('first');
  let currentPage = $state('history');
</script>

{#snippet template(args: ComponentProps<typeof Segment>)}
  <div class="bg-background-primary p-6 text-primary">
    <SegmentedControl>
      <Segment {...args}>Segment</Segment>
    </SegmentedControl>
  </div>
{/snippet}

<Story name="Playground" {template} />

<Story name="Default">
  {#snippet template()}
    <div class="bg-background-primary p-6 text-primary">
      <SegmentedControl aria-label="Segments">
        {#each ['first', 'second', 'third'] as segment (segment)}
          <Segment
            selected={selectedSegment === segment}
            count={0}
            onclick={() => (selectedSegment = segment)}>Segment</Segment
          >
        {/each}
      </SegmentedControl>
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
          {#each [false, true] as selected (selected)}
            <tr>
              <th scope="row" class="text-left text-xs text-secondary">
                {selected ? 'selected' : 'unselected'}
              </th>
              {#each states as state (state)}
                <td>
                  <SegmentedControl>
                    <Segment
                      {selected}
                      data-state={state}
                      disabled={state === 'disabled'}
                      count={4}>Segment</Segment
                    >
                  </SegmentedControl>
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/snippet}
</Story>

<Story name="Variants">
  {#snippet template()}
    <div class="bg-background-primary p-6 text-primary">
      <SegmentedControl>
        <Segment selected>Text only</Segment>
        <Segment count={12}>With count</Segment>
        <Segment Icon={IconAdd}>With icon</Segment>
        <Segment isLoading>Loading</Segment>
        <Segment disabled count={0}>Disabled</Segment>
      </SegmentedControl>
    </div>
  {/snippet}
</Story>

<Story name="Navigation">
  {#snippet template()}
    <div class="bg-background-primary p-6 text-primary">
      <SegmentedControl element="nav" aria-label="Workflow pages">
        {#each [{ page: 'history', count: 12 }, { page: 'workers', count: 2 }, { page: 'relationships', count: 0 }] as { page, count } (page)}
          <SegmentLink
            href={`#${page}`}
            selected={currentPage === page}
            {count}
            onclick={(event) => {
              event.preventDefault();
              currentPage = page;
            }}>{page}</SegmentLink
          >
        {/each}
      </SegmentedControl>
    </div>
  {/snippet}
</Story>

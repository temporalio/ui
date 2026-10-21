<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import { IconAdd } from '$lib/io/icon';

  import PillGroup from './pill-group.svelte';
  import Pill from './pill.svelte';

  const states = ['default', 'hover', 'active', 'disabled'];

  const { Story } = defineMeta({
    title: 'IO/Design System/Pill',
    component: Pill,
    args: {
      active: false,
      disabled: false,
      isLoading: false,
    },
    argTypes: {
      active: { control: 'boolean' },
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
  let selected = $state('inbound');
</script>

{#snippet template(args: ComponentProps<typeof Pill>)}
  <div class="bg-background-primary p-6 text-primary">
    <PillGroup>
      <Pill {...args}>Pill</Pill>
    </PillGroup>
  </div>
{/snippet}

<Story name="Playground" {template} />

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
          {#each [false, true] as active (active)}
            <tr>
              <th scope="row" class="text-left text-xs text-secondary">
                {active ? 'active' : 'inactive'}
              </th>
              {#each states as state (state)}
                <td>
                  <PillGroup>
                    <Pill
                      {active}
                      data-state={state}
                      disabled={state === 'disabled'}
                      count={4}>Pill</Pill
                    >
                  </PillGroup>
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
    <div
      class="flex flex-wrap items-center gap-4 bg-background-primary p-6 text-primary"
    >
      <PillGroup>
        <Pill>Text only</Pill>
        <Pill count={12}>With count</Pill>
        <Pill Icon={IconAdd}>With icon</Pill>
        <Pill isLoading>Loading</Pill>
      </PillGroup>
    </div>
  {/snippet}
</Story>

<Story name="Group">
  {#snippet template()}
    <div class="bg-background-primary p-6 text-primary">
      <PillGroup>
        {#each ['inbound', 'outbound', 'empty'] as view (view)}
          <Pill
            active={selected === view}
            disabled={view === 'empty'}
            count={view === 'empty' ? 0 : 3}
            onclick={() => (selected = view)}>{view}</Pill
          >
        {/each}
      </PillGroup>
    </div>
  {/snippet}
</Story>

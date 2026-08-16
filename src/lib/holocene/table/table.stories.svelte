<script lang="ts" module>
  import { defineMeta, type StoryContext } from '@storybook/addon-svelte-csf';
  import { expect, userEvent, within } from 'storybook/test';
  import type { ComponentProps } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import Table from '$lib/holocene/table/table.svelte';

  import {
    redesignForcedColorsParameters,
    redesignVisualParameters,
  } from '../../../../.storybook/visual-modes';

  type TableArgs = Omit<ComponentProps<typeof Table>, 'columns' | 'rows'> & {
    columns?: number;
    rows?: number;
  };

  const { Story } = defineMeta({
    title: 'Table',
    component: Table,
    args: {
      columns: 3,
      rows: 3,
    },
    argTypes: {
      columns: { control: 'number' },
      rows: { control: 'number' },
    },
    render: template,
  });
</script>

{#snippet template(args: TableArgs, context: StoryContext<TableArgs>)}
  <Table class="w-full" updating={args.updating} data-testid={context.id}>
    {#snippet headers()}
      <tr>
        {#each Array(args.columns) as _, index (index)}
          <th>Heading {index + 1}</th>
        {/each}
      </tr>
    {/snippet}
    {#each Array(args.rows) as _, rowIndex (rowIndex)}
      <tr>
        {#each Array(args.columns) as _, colIdx (colIdx)}
          <td>Cell {colIdx + 1}</td>
        {/each}
      </tr>
    {/each}
  </Table>
{/snippet}

<Story name="Primary" args={{}} parameters={redesignVisualParameters} />

<Story name="Primary, Updating" args={{ updating: true }} />

<Story
  name="Interaction and Long Content"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const focusAction = canvas.getByRole('button', {
      name: 'Inspect first workflow',
    });
    const hoverRow = canvas.getByTestId('hover-row');

    await userEvent.tab();
    expect(focusAction).toHaveFocus();
    await userEvent.hover(hoverRow);
  }}
>
  {#snippet template(_args, context)}
    <Table class="w-full" data-testid={context.id}>
      {#snippet headers()}
        <tr>
          <th>Workflow ID</th>
          <th>Status</th>
          <th><span class="sr-only">Actions</span></th>
        </tr>
      {/snippet}
      <tr>
        <td class="font-mono">
          customer-order-reconciliation-us-central-2026-08-15-001
        </td>
        <td>Running</td>
        <td class="text-right">
          <Button size="xs" variant="ghost" aria-label="Inspect first workflow">
            Inspect
          </Button>
        </td>
      </tr>
      <tr data-testid="hover-row">
        <td class="font-mono">billing-ledger-repair-2026-08-15-047</td>
        <td>Completed</td>
        <td class="text-right">
          <Button
            size="xs"
            variant="ghost"
            aria-label="Inspect second workflow"
          >
            Inspect
          </Button>
        </td>
      </tr>
    </Table>
  {/snippet}
</Story>

<Story
  name="Forced Colors"
  args={{ columns: 4, rows: 4, updating: true }}
  parameters={redesignForcedColorsParameters}
/>

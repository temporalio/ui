<script lang="ts" module>
  import { defineMeta, type StoryContext } from '@storybook/addon-svelte-csf';
  import type { ComponentProps, Snippet } from 'svelte';

  import Table from '$lib/holocene/table/table.svelte';

  type TableArgs = Omit<ComponentProps<typeof Table>, 'columns' | 'rows'> & {
    columns?: number;
    rows?: number;
  };
  type TableTemplate = Snippet<[TableArgs, StoryContext<TableArgs>]>;

  const { Story } = defineMeta<TableTemplate, typeof Table>({
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
  });
</script>

<script lang="ts">
  import { onDestroy } from 'svelte';

  import Button from '$lib/holocene/button.svelte';

  let updating = $state(false);
  let status = $state('Ready. Choose a timing scenario.');
  let timeouts: ReturnType<typeof setTimeout>[] = [];

  function clearTimers() {
    timeouts.forEach((timeout) => clearTimeout(timeout));
    timeouts = [];
  }

  function schedule(delay: number, callback: () => void) {
    const timeout = setTimeout(() => {
      timeouts = timeouts.filter((item) => item !== timeout);
      callback();
    }, delay);

    timeouts.push(timeout);
  }

  function reset() {
    clearTimers();
    updating = false;
    status = 'Ready. Choose a timing scenario.';
  }

  function runFastUpdate() {
    reset();
    updating = true;
    status = 'Fast update: resolving at 100ms. The comet must not appear.';
    schedule(100, () => {
      updating = false;
      status = 'Fast update complete. No comet should have appeared.';
    });
  }

  function runNormalUpdate() {
    reset();
    updating = true;
    status =
      'Normal update: loading is active. The comet should appear after 150ms.';
    schedule(850, () => {
      updating = false;
      status = 'Normal update resolved. The comet should fade out over 350ms.';
    });
    schedule(1200, () => {
      status = 'Normal update complete. The comet should be removed.';
    });
  }

  function runRapidRestart() {
    reset();
    updating = true;
    status =
      'Rapid restart: loading is active. The comet should be visible before 500ms.';
    schedule(500, () => {
      updating = false;
      status =
        'Rapid restart: resolved at 500ms. Restarting in 50ms; the comet must remain visible.';
    });
    schedule(550, () => {
      updating = true;
      status =
        'Rapid restart: loading resumed after 50ms. The comet must not disappear or restart.';
    });
    schedule(1350, () => {
      updating = false;
      status =
        'Rapid restart resolved. The comet should now fade out over 350ms.';
    });
    schedule(1700, () => {
      status = 'Rapid restart complete. The comet should be removed.';
    });
  }

  onDestroy(clearTimers);
</script>

{#snippet template(args: TableArgs, context: StoryContext<TableArgs>)}
  <Table class="w-full" updating={args.updating} data-testid={context.id}>
    {#snippet headers()}
      <tr>
        {#each Array(args.columns) as _, index}
          <th>Heading {index + 1}</th>
        {/each}
      </tr>
    {/snippet}
    {#each Array(args.rows) as _}
      <tr>
        {#each Array(args.columns) as _, colIdx}
          <td>Cell {colIdx + 1}</td>
        {/each}
      </tr>
    {/each}
  </Table>
{/snippet}

<Story name="Primary" args={{}} {template} />

<Story name="Primary, Updating" args={{ updating: true }} {template} />

<Story name="Updating Timing Harness" asChild>
  <div class="space-y-4 p-4">
    <div
      role="group"
      aria-label="Table loading timing scenarios"
      class="flex flex-wrap gap-2"
    >
      <Button onclick={runFastUpdate}>Run fast update</Button>
      <Button onclick={runNormalUpdate}>Run normal update</Button>
      <Button onclick={runRapidRestart}>Run rapid restart</Button>
      <Button variant="secondary" onclick={reset}>Reset</Button>
    </div>
    <p role="status" aria-live="polite" class="text-sm text-secondary">
      {status}
    </p>
    <Table
      class="w-full"
      {updating}
      data-testid="table-updating-timing-harness"
    >
      {#snippet headers()}
        <tr>
          <th>Heading 1</th>
          <th>Heading 2</th>
          <th>Heading 3</th>
        </tr>
      {/snippet}
      <tr>
        <td>Cell 1</td>
        <td>Cell 2</td>
        <td>Cell 3</td>
      </tr>
      <tr>
        <td>Cell 1</td>
        <td>Cell 2</td>
        <td>Cell 3</td>
      </tr>
      <tr>
        <td>Cell 1</td>
        <td>Cell 2</td>
        <td>Cell 3</td>
      </tr>
    </Table>
  </div>
</Story>

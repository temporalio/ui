<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, userEvent, waitFor, within } from 'storybook/test';
  import type { ComponentProps } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import CommandRail from '$lib/holocene/command-rail.svelte';

  import { redesignVisualParameters } from '../../../.storybook/visual-modes';

  const workflowActions = [
    'Start workflow',
    'Send signal',
    'Run query',
    'Request update',
    'Pause workflow',
    'Reset workflow',
    'Cancel workflow',
    'Terminate workflow',
    'Download history',
  ] as const;

  const { Story } = defineMeta({
    title: 'Command Rail',
    component: CommandRail,
    args: {
      id: 'workflow-actions-rail',
      label: 'workflow actions',
      role: 'toolbar',
      controlClass: 'surface-primary',
      'data-testid': 'workflow-actions-rail',
    },
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof CommandRail>)}
  {@const { children: _, ...commandRailProps } = args}
  <div class="surface-primary w-[21rem] rounded-panel border border-subtle p-3">
    <CommandRail {...commandRailProps} viewportClass="py-1">
      <div class="flex w-max items-center gap-2 px-1">
        {#each workflowActions as action (action)}
          <Button
            size="sm"
            variant={action === 'Terminate workflow'
              ? 'destructive'
              : 'secondary'}
            data-testid={`workflow-action-${action
              .toLowerCase()
              .replaceAll(' ', '-')}`}
          >
            {action}
          </Button>
        {/each}
      </div>
    </CommandRail>
  </div>
{/snippet}

<Story
  name="Overflow and Focus Reveal"
  parameters={redesignVisualParameters}
  play={async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const rail = canvas.getByTestId('workflow-actions-rail');
    const viewport = canvas.getByTestId('workflow-actions-rail-viewport');

    await step('Scroll forward with the overflow control', async () => {
      await waitFor(() =>
        expect(viewport.scrollWidth).toBeGreaterThan(viewport.clientWidth),
      );

      const initialScrollLeft = viewport.scrollLeft;
      const next = await canvas.findByRole('button', {
        name: 'Scroll workflow actions forward',
      });

      await userEvent.click(next);
      await waitFor(() =>
        expect(viewport.scrollLeft).toBeGreaterThan(initialScrollLeft),
      );
      expect(rail).toHaveAttribute('data-overflow-start', 'true');
      expect(
        canvas.getByRole('button', {
          name: 'Scroll workflow actions backward',
        }),
      ).toBeVisible();
    });

    await step('Reveal a focused action outside the viewport', async () => {
      const scrollBeforeFocus = viewport.scrollLeft;
      const lastAction = canvas.getByRole('button', {
        name: 'Download history',
      });

      lastAction.focus({ preventScroll: true });
      expect(lastAction).toHaveFocus();

      await waitFor(() => {
        const viewportBounds = viewport.getBoundingClientRect();
        const actionBounds = lastAction.getBoundingClientRect();

        expect(actionBounds.left).toBeGreaterThanOrEqual(
          viewportBounds.left - 1,
        );
        expect(actionBounds.right).toBeLessThanOrEqual(
          viewportBounds.right + 1,
        );
      });
      expect(viewport.scrollLeft).toBeGreaterThan(scrollBeforeFocus);
    });
  }}
/>

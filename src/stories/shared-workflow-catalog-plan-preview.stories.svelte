<svelte:options runes />

<script lang="ts" module>
  import type { Meta } from '@storybook/svelte';
  import { expect, userEvent, within } from '@storybook/test';

  import SharedWorkflowCatalogPlanPreview from './shared-workflow-catalog-plan-preview.svelte';

  export const meta = {
    title: 'Pitches/Shared Workflow Catalog',
    component: SharedWorkflowCatalogPlanPreview,
    parameters: {
      layout: 'fullscreen',
    },
    tags: ['shared-workflow-catalog-pitch'],
  } satisfies Meta<typeof SharedWorkflowCatalogPlanPreview>;
</script>

<script lang="ts">
  import { Story } from '@storybook/addon-svelte-csf';
</script>

<Story
  name="Plan Review"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', {
        level: 1,
        name: 'Make Temporal UI features easy to prove.',
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('This is a plan preview'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Planned repository Agent Skill'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByLabelText('Proposed example registration'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Illustrative, nonnormative'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(/does not settle the final TypeScript API/),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('heading', {
        level: 3,
        name: 'Choose an example to run and inspect.',
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: 'Configure example' }),
    ).not.toBeInTheDocument();
    const availableExamples = within(
      canvas.getByRole('region', { name: 'Available examples' }),
    );
    await expect(
      availableExamples.getByRole('button', { name: /Order lifecycle/ }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('search', { name: 'Filter example catalog' }),
    ).toBeInTheDocument();
    const provenanceFilter = within(
      canvas.getByRole('radiogroup', { name: 'Example provenance filter' }),
    );
    await expect(
      provenanceFilter.getByRole('radio', { name: 'All' }),
    ).toHaveAttribute('aria-checked', 'true');
    const exampleNavigation = within(
      canvas.getByRole('navigation', { name: 'Examples' }),
    );
    await expect(
      exampleNavigation.getByRole('button', { name: /Priority lanes/ }),
    ).toBeInTheDocument();

    await userEvent.click(
      exampleNavigation.getByRole('button', { name: /Order lifecycle/ }),
    );
    await expect(
      canvas.getByRole('heading', {
        level: 4,
        name: 'Workflow launch defaults',
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('orderLifecycleWorkflow'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByLabelText('Edit arguments JSON'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Configure example' }),
    ).toHaveAttribute('aria-expanded', 'false');
    await expect(
      canvas.queryByLabelText('Edit start options JSON'),
    ).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Configure example' }),
    );
    await expect(
      canvas.getByRole('heading', {
        level: 4,
        name: 'Configure workflow launch',
      }),
    ).toBeInTheDocument();
    await expect(canvas.getAllByLabelText('Edit arguments JSON')).toHaveLength(
      1,
    );
    await expect(
      canvas.getByLabelText('Edit start options JSON'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Configure example' }),
    ).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(canvas.getByRole('button', { name: 'All examples' }));
    await expect(
      canvas.getByRole('heading', {
        level: 3,
        name: 'Choose an example to run and inspect.',
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: 'Configure example' }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      exampleNavigation.getByRole('button', { name: /Priority lanes/ }),
    );
    await expect(
      canvas.getByRole('heading', {
        level: 4,
        name: 'Standalone activity start',
      }),
    ).toBeInTheDocument();
    await expect(canvas.getByText('priorityLaneActivity')).toBeInTheDocument();
    await expect(
      canvas.getByLabelText('Edit activity input JSON'),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByText('Schema guidance active'),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Configure example' }),
    ).toHaveAttribute('aria-expanded', 'false');
    await expect(
      canvas.queryByLabelText('Edit activity start options JSON'),
    ).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Configure example' }),
    );
    await expect(
      canvas.getByRole('heading', {
        level: 4,
        name: 'Configure standalone activity',
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getAllByLabelText('Edit activity input JSON'),
    ).toHaveLength(1);
    await expect(
      canvas.getByLabelText('Edit activity start options JSON'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Configure example' }),
    ).toHaveAttribute('aria-expanded', 'true');
  }}
/>

<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import CountBadge from './count-badge.svelte';

  const { Story } = defineMeta({
    title: 'Io/Badge/Count Badge',
    component: CountBadge,
    args: {
      value: 12,
      type: 'count',
      variant: 'neutral',
      max: 99,
    },
    argTypes: {
      value: { control: { type: 'number', min: 0, step: 1 } },
      total: {
        control: { type: 'number', min: 0, step: 1 },
        if: { arg: 'type', eq: 'total' },
      },
      type: { control: 'select', options: ['count', 'total'] },
      variant: { control: 'select', options: ['neutral', 'error'] },
      max: {
        control: { type: 'number', min: 1, step: 1 },
        if: { arg: 'type', eq: 'count' },
      },
      Icon: { control: false },
      class: { table: { disable: true } },
    },
    parameters: {
      layout: 'padded',
    },
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof CountBadge>)}
  <div class="bg-background-primary p-6 text-primary">
    <CountBadge {...args} />
  </div>
{/snippet}

<Story name="Playground" />

<Story name="Total" args={{ type: 'total', value: 12, total: 20 }} />

<Story name="Error" args={{ value: 20, variant: 'error' }} />

<Story name="Capped" args={{ value: 120, max: 99 }} />

<Story name="Variants">
  {#snippet template()}
    <div class="flex flex-wrap items-end gap-6 bg-background-primary p-6">
      <div class="flex flex-col items-start gap-2">
        <span class="text-xs text-secondary">Count · Neutral</span>
        <CountBadge value={12} />
      </div>
      <div class="flex flex-col items-start gap-2">
        <span class="text-xs text-secondary">Total · Neutral</span>
        <CountBadge type="total" value={12} total={20} />
      </div>
      <div class="flex flex-col items-start gap-2">
        <span class="text-xs text-secondary">Count · Error</span>
        <CountBadge value={20} variant="error" />
      </div>
    </div>
  {/snippet}
</Story>

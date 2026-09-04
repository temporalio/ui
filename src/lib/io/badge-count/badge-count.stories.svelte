<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import BadgeCount from './badge-count.svelte';

  const { Story } = defineMeta({
    title: 'IO/Design System/Badge Count',
    component: BadgeCount,
    args: {
      value: '12',
    },
    argTypes: {
      value: { control: 'text' },
      total: { control: 'text' },
      class: { table: { disable: true } },
    },
    parameters: {
      layout: 'padded',
    },
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof BadgeCount>)}
  <div class="border border-primary bg-surface-primary p-6 text-primary">
    <BadgeCount {...args} />
  </div>
{/snippet}

<Story name="Playground" />

<Story name="Examples">
  {#snippet template()}
    <div
      class="flex flex-wrap items-end gap-6 border border-primary bg-surface-primary p-6"
    >
      <div class="flex flex-col items-start gap-2">
        <span class="text-xs text-secondary">Single</span>
        <BadgeCount value={12} />
      </div>
      <div class="flex flex-col items-start gap-2">
        <span class="text-xs text-secondary">Total</span>
        <BadgeCount value={12} total={20} />
      </div>
    </div>
  {/snippet}
</Story>

<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import { IconClose, IconRegions } from '$lib/io/icon';

  import type { ChipColorScheme } from './chip.svelte';
  import Chip from './chip.svelte';

  const colorSchemes: ChipColorScheme[] = [
    'neutral',
    'info',
    'success',
    'warning',
    'danger',
    'error',
  ];

  const { Story } = defineMeta({
    title: 'IO/Design System/Chip',
    component: Chip,
    args: {
      text: 'chip',
      colorScheme: 'neutral',
      extension: { text: 'ext' },
      disabled: false,
    },
    argTypes: {
      text: { control: 'text' },
      colorScheme: { control: 'select', options: colorSchemes },
      disabled: { control: 'boolean' },
      Icon: { control: false },
      extension: { control: 'object' },
      class: { table: { disable: true } },
    },
    parameters: {
      layout: 'padded',
    },
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof Chip>)}
  <div class="border border-primary bg-surface-primary p-6 text-primary">
    <Chip {...args} />
  </div>
{/snippet}

<Story name="Playground" />

<Story name="Color schemes">
  {#snippet template()}
    <div
      class="flex flex-wrap items-center gap-4 border border-primary bg-surface-primary p-6"
    >
      {#each colorSchemes as colorScheme (colorScheme)}
        <div class="flex flex-col items-start gap-2">
          <span class="text-xs text-secondary">{colorScheme}</span>
          <Chip
            {colorScheme}
            text="chip"
            Icon={IconRegions}
            extension={{ text: 'ext', Icon: IconClose }}
          />
        </div>
      {/each}
    </div>
  {/snippet}
</Story>

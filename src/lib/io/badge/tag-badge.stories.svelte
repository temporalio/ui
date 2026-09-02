<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import type { TagBadgeVariant } from './types';

  import TagBadge from './tag-badge.svelte';

  const variants: TagBadgeVariant[] = [
    'neutral',
    'info',
    'success',
    'warning',
    'danger',
    'accent',
  ];

  const { Story } = defineMeta({
    title: 'Io/Badge/Tag Badge',
    component: TagBadge,
    args: {
      text: 'tag',
      variant: 'neutral',
    },
    argTypes: {
      text: { control: 'text' },
      variant: { control: 'select', options: variants },
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

{#snippet template(args: ComponentProps<typeof TagBadge>)}
  <div class="bg-background-primary p-6 text-primary">
    <TagBadge {...args} />
  </div>
{/snippet}

<Story name="Playground" />

<Story name="With extension" args={{ extension: { text: 'extension' } }} />

<Story
  name="Without icons"
  args={{ Icon: null, extension: { text: 'extension', Icon: null } }}
/>

<Story name="Variants">
  {#snippet template()}
    <div class="flex flex-wrap items-center gap-4 bg-background-primary p-6">
      {#each variants as variant (variant)}
        <div class="flex flex-col items-start gap-2">
          <span class="text-xs text-secondary">{variant}</span>
          <TagBadge {variant} text="tag" extension={{ text: 'extension' }} />
        </div>
      {/each}
    </div>
  {/snippet}
</Story>

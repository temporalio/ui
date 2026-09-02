<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import type { TagColorScheme } from './tag.svelte';
  import Tag from './tag.svelte';

  const colorSchemes: TagColorScheme[] = [
    'neutral',
    'info',
    'success',
    'warning',
    'danger',
    'accent',
  ];

  const { Story } = defineMeta({
    title: 'Io/Tag',
    component: Tag,
    args: {
      text: 'tag',
      colorScheme: 'neutral',
    },
    argTypes: {
      text: { control: 'text' },
      colorScheme: { control: 'select', options: colorSchemes },
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

{#snippet template(args: ComponentProps<typeof Tag>)}
  <div class="border border-primary bg-surface-primary p-6 text-primary">
    <Tag {...args} />
  </div>
{/snippet}

<Story name="Playground" />

<Story name="With extension" args={{ extension: { text: 'extension' } }} />

<Story
  name="Without icons"
  args={{ Icon: null, extension: { text: 'extension', Icon: null } }}
/>

<Story name="Color schemes">
  {#snippet template()}
    <div
      class="flex flex-wrap items-center gap-4 border border-primary bg-surface-primary p-6"
    >
      {#each colorSchemes as colorScheme (colorScheme)}
        <div class="flex flex-col items-start gap-2">
          <span class="text-xs text-secondary">{colorScheme}</span>
          <Tag {colorScheme} text="tag" extension={{ text: 'extension' }} />
        </div>
      {/each}
    </div>
  {/snippet}
</Story>

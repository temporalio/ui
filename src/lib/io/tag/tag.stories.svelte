<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import { IconTag } from '$lib/io/icon';
  import { Tag, type TagColorScheme } from '$lib/io/tag';

  import usage from './tag.usage.md?raw';

  const colorSchemes: TagColorScheme[] = [
    'neutral',
    'info',
    'success',
    'warning',
    'danger',
    'accent',
  ];

  const { Story } = defineMeta({
    title: 'Components/Tag',
    tags: ['autodocs'],
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
      docs: {
        group: 'Labels and status',
        description: {
          component:
            'A non-interactive metadata label with a tag icon and optional extension.',
        },
        usage,
      },
      layout: 'padded',
    },
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof Tag>)}
  <Tag {...args} />
{/snippet}

<Story tags={['!dev']} name="Playground" />

<Story name="With extension" args={{ extension: { text: 'extension' } }} />

<Story
  name="With extension icon"
  args={{ extension: { text: 'extension', Icon: IconTag } }}
/>

<Story
  name="Without icons"
  args={{ Icon: null, extension: { text: 'extension' } }}
/>

<Story name="Color schemes">
  {#snippet template()}
    <div class="flex flex-wrap items-center gap-4">
      {#each colorSchemes as colorScheme (colorScheme)}
        <div class="flex flex-col items-start gap-2">
          <span class="text-xs text-secondary">{colorScheme}</span>
          <Tag {colorScheme} text="tag" extension={{ text: 'extension' }} />
        </div>
      {/each}
    </div>
  {/snippet}
</Story>

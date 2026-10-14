<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import { Badge, type BadgeColorScheme, type BadgeSize } from '$lib/io/badge';
  import {
    IconAwsColor,
    IconExclamationOctagon,
    IconHeartbeat,
  } from '$lib/io/icon';

  const sizes: BadgeSize[] = ['sm', 'md'];

  const colorSchemes: BadgeColorScheme[] = [
    'neutral',
    'info',
    'success',
    'warning',
    'danger',
    'error',
    'accent',
  ];

  const { Story } = defineMeta({
    title: 'IO/Design System/Badge',
    component: Badge,
    args: {
      text: 'badge',
      colorScheme: 'neutral',
      size: 'md',
    },
    argTypes: {
      text: { control: 'text' },
      colorScheme: { control: 'select', options: colorSchemes },
      size: { control: 'select', options: sizes },
      truncate: { control: 'boolean' },
      Icon: { control: false },
      extension: { control: 'object' },
      extensions: { control: 'object' },
      class: { table: { disable: true } },
    },
    parameters: {
      layout: 'padded',
    },
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof Badge>)}
  <div class="border border-primary bg-surface-primary p-6 text-primary">
    <Badge {...args} />
  </div>
{/snippet}

<Story name="Playground" />

<Story name="With icon" args={{ Icon: IconHeartbeat }} />

<Story
  name="With extension"
  args={{
    Icon: IconHeartbeat,
    extension: {
      text: '987',
      LeadIcon: IconAwsColor,
      TrailIcon: IconExclamationOctagon,
    },
  }}
/>

<Story
  name="With multiple extensions"
  args={{
    Icon: IconHeartbeat,
    extensions: [
      { text: '987', LeadIcon: IconAwsColor },
      {
        text: 'warning',
        colorScheme: 'warning',
        TrailIcon: IconExclamationOctagon,
      },
      false,
    ],
  }}
/>

<Story name="Primary truncation">
  {#snippet template()}
    <div class="w-64 border border-primary bg-surface-primary p-6">
      <Badge
        text="A long badge label that should truncate"
        truncate
        Icon={IconHeartbeat}
        extensions={[
          { text: '987' },
          { colorScheme: 'warning', TrailIcon: IconExclamationOctagon },
        ]}
      />
    </div>
  {/snippet}
</Story>

<Story name="Extension truncation">
  {#snippet template()}
    <div class="w-64 border border-primary bg-surface-primary p-6">
      <Badge
        text="A long badge label that should truncate"
        truncate
        Icon={IconHeartbeat}
        extensions={[
          { text: '987' },
          {
            text: 'A long extension that should also truncate',
            colorScheme: 'warning',
            truncate: true,
          },
        ]}
      />
    </div>
  {/snippet}
</Story>

<Story name="Sizes">
  {#snippet template()}
    <div
      class="flex flex-wrap items-end gap-4 border border-primary bg-surface-primary p-6"
    >
      {#each sizes as size (size)}
        <div class="flex flex-col items-start gap-2">
          <span class="text-xs text-secondary">{size}</span>
          <Badge
            {size}
            text="badge"
            extension={{ text: '987', TrailIcon: IconExclamationOctagon }}
          />
        </div>
      {/each}
    </div>
  {/snippet}
</Story>

<Story name="Color schemes">
  {#snippet template()}
    <div
      class="flex flex-wrap items-center gap-4 border border-primary bg-surface-primary p-6"
    >
      {#each colorSchemes as colorScheme (colorScheme)}
        <div class="flex flex-col items-start gap-2">
          <span class="text-xs text-secondary">{colorScheme}</span>
          <Badge
            {colorScheme}
            text="badge"
            extension={{ text: '987', TrailIcon: IconExclamationOctagon }}
          />
        </div>
      {/each}
    </div>
  {/snippet}
</Story>

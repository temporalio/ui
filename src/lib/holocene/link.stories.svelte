<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import { iconNames } from './icon';

  import Link from './link.svelte';

  export const meta = {
    title: 'Link',
    component: Link,
    args: {
      href: 'https://temporal.io',
      icon: undefined,
      active: false,
      newTab: false,
      inverse: false,
    },
    argTypes: {
      href: { control: 'text' },
      icon: { control: 'select', options: iconNames },
      class: { table: { disable: true } },
    },
  } satisfies Meta;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import { twMerge } from 'tailwind-merge';
</script>

<Template let:args>
  <div class={twMerge(args.inverse && 'bg-inverse')}>
    <Link {...args}>This is a link.</Link>
  </div>
</Template>

<Story name="Default" />

<Story name="With Icon" args={{ icon: 'close' }} />

<Story name="Active" args={{ active: true }} />

<Story name="Open in New Tab" args={{ newTab: true }} />

<Story name="Inverse" args={{ inverse: true }} />

<Story
  name="Default (Dark)"
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="With Icon (Dark)"
  args={{ icon: 'close' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Active (Dark)"
  args={{ active: true }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Open in New Tab (Dark)"
  args={{ newTab: true }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Inverse (Dark)"
  args={{ inverse: true }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

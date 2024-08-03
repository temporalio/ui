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
      light: false,
    },
    argTypes: {
      href: { control: 'text' },
      icon: { control: 'select', options: iconNames },
    },
  } satisfies Meta<Link>;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import { twMerge } from 'tailwind-merge';
</script>

<Template let:args>
  <div class={twMerge(args.light && 'bg-space-black')}>
    <Link {...args}>This is a link.</Link>
  </div>
</Template>

<Story name="Default" />

<Story name="With Icon" args={{ icon: 'close' }} />

<Story name="Active" args={{ active: true }} />

<Story name="Light" args={{ light: true }} />

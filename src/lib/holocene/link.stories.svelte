<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  import type { IconName } from './icon';
  import { iconNames } from './icon';

  import Link from './link.svelte';

  const { Story } = defineMeta({
    title: 'Link',
    component: Link,
    args: {
      href: 'https://temporal.io',
      icon: undefined as IconName | undefined,
      active: false,
      newTab: false,
      light: false,
    },
    argTypes: {
      href: { control: 'text' },
      icon: { control: 'select', options: iconNames },
    },
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof Link>)}
  <div class={twMerge(args.light && 'bg-space-black')}>
    <Link {...args}>This is a link.</Link>
  </div>
{/snippet}

<Story name="Default" />

<Story name="With Icon" args={{ icon: 'close' }} />

<Story name="Active" args={{ active: true }} />

<Story name="Light" args={{ light: true }} />

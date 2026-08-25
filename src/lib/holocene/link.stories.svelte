<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  import * as ioIcons from '$lib/io/icon';

  const iconOptions: Record<string, unknown> = { ...ioIcons };

  import Link from './link.svelte';

  const { Story } = defineMeta({
    title: 'Link',
    component: Link,
    args: {
      href: 'https://temporal.io',
      active: false,
      newTab: false,
      light: false,
    },
    argTypes: {
      href: { control: 'text' },
      LeadingIcon: {
        control: 'select',
        options: Object.keys(iconOptions),
        mapping: iconOptions,
      },
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

<Story name="With Icon" args={{ LeadingIcon: ioIcons.IconClose }} />

<Story name="Active" args={{ active: true }} />

<Story name="Light" args={{ light: true }} />

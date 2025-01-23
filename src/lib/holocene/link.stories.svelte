<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
  } from '@storybook/addon-svelte-csf';

  import { iconNames } from './icon';

  import Link from './link.svelte';

  const { Story } = defineMeta({
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
  });
</script>

<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  setTemplate(template);
</script>

{#snippet template({ href, ...args }: Args<typeof Story>)}
  <div class={twMerge(args.light && 'bg-space-black')}>
    <Link {href} {...args}>This is a link.</Link>
  </div>
{/snippet}

<Story name="Default" />

<Story name="With Icon" args={{ icon: 'close' }} />

<Story name="Active" args={{ active: true }} />

<Story name="Light" args={{ light: true }} />

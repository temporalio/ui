<script lang="ts">
  import { Meta, Story } from '@storybook/addon-svelte-csf';

  import { iconNames } from './icon/paths';

  import Link from './link.svelte';
</script>

<Meta
  title="Link"
  component={Link}
  argTypes={{
    href: { control: 'text' },
    icon: { control: 'select', options: iconNames },
  }}
/>

<Story name="link" let:args>
  <Link href="https://temporal.io" {...args}>Click Me!</Link>
</Story>

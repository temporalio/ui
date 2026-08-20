<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import Search from './search.svelte';

  const { Story } = defineMeta({
    title: 'Search',
    component: Search,
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof Search>)}
  <div
    class="border border-io-border-primary bg-io-surface-primary p-4 text-io-content-primary"
  >
    <Search {...args} />
  </div>
{/snippet}

<Story name="Default" />

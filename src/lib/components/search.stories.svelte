<script lang="ts" context="module">
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import type { Meta } from '@storybook/svelte';

  import Search from './search.svelte';

  export const meta = {
    title: 'Holocene/Search',
    component: Search,
  } satisfies Meta<Search>;
</script>

<Template let:args>
  <Search {...args} />
</Template>

<Story name="Default" />

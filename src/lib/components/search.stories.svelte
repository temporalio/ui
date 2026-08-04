<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import Search from './search.svelte';

  const { Story } = defineMeta({
    title: 'Search',
    component: Search,
  });
</script>

<Story name="Default" />

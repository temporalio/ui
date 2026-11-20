<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import DetailPageExample from './detail-page-example.svelte';
  import ListPageExample from './list-page-example.svelte';

  const { Story } = defineMeta({
    title: 'IO/Guides/Page Layouts and Templates',
    component: ListPageExample,
  });
</script>

<Story name="List page" asChild>
  <ListPageExample />
</Story>

<Story name="Detail page" asChild>
  <DetailPageExample />
</Story>

<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import Example from './api-paginated-sort-harness.svelte';

  const { Story } = defineMeta({
    title: 'Table/API Paginated',
    component: Example,
    parameters: {
      sveltekit_experimental: {
        stores: {
          page: {
            url: new URL('http://localhost/table'),
            params: {},
            data: {},
          },
        },
      },
    },
  });
</script>

<Story name="Sortable" />
<Story
  name="Empty"
  args={{ onFetch: async () => async () => ({ items: [], nextPageToken: '' }) }}
/>
<Story
  name="Loading"
  args={{ onFetch: async () => async () => new Promise(() => {}) }}
/>
<Story
  name="Error"
  args={{
    onFetch: async () => async () => {
      throw new Error('Unable to load results');
    },
  }}
/>

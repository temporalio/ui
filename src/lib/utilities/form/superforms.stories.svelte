<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import SuperFormsExample from './superforms-example.svelte';

  const { Story } = defineMeta({
    title: 'IO/Guides/Forms',
    component: SuperFormsExample,
  });
</script>

<Story name="SuperForms Examples" asChild>
  <SuperFormsExample />
</Story>

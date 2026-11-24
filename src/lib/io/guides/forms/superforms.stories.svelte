<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import SuperFormsExample from './superforms-example.svelte';

  const { Story } = defineMeta({
    title: 'Guides/Forms',
    component: SuperFormsExample,
    parameters: {
      docs: {
        description: {
          component: 'Building forms with SuperForms and schema validation.',
        },
      },
    },
  });
</script>

<Story name="SuperForms Examples" asChild>
  <SuperFormsExample />
</Story>

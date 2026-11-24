<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import ConfirmationModalExample from './confirmation-modal-example.svelte';
  import DrawerFormExample from './drawer-form-example.svelte';

  const { Story } = defineMeta({
    title: 'Guides/Modals and Drawers',
    component: ConfirmationModalExample,
    parameters: {
      docs: {
        description: {
          component: 'Confirmations, error handling, and forms in drawers.',
        },
      },
    },
  });
</script>

<Story name="Confirmation modal" asChild>
  <ConfirmationModalExample />
</Story>

<Story name="Form in a drawer" asChild>
  <DrawerFormExample />
</Story>

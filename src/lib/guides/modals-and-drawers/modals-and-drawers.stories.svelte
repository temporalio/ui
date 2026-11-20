<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import ConfirmationModalExample from './confirmation-modal-example.svelte';
  import DrawerFormExample from './drawer-form-example.svelte';

  const { Story } = defineMeta({
    title: 'IO/Guides/Modals and Drawers',
    component: ConfirmationModalExample,
  });
</script>

<Story name="Confirmation modal" asChild>
  <ConfirmationModalExample />
</Story>

<Story name="Form in a drawer" asChild>
  <DrawerFormExample />
</Story>

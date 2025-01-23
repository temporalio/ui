<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
  } from '@storybook/addon-svelte-csf';

  import Modal from './modal.svelte';

  const { Story } = defineMeta({
    title: 'Modal',
    component: Modal,
    args: {
      open: true,
      large: false,
      loading: false,
      error: '',
      confirmText: 'Confirm',
      hideConfirm: false,
      confirmDisabled: false,
      cancelText: 'Cancel',
      hightlightNav: false,
    },
    argTypes: {
      open: {
        name: 'Open',
        control: 'boolean',
        table: {
          disable: true,
        },
      },
      large: {
        name: 'Large Size',
        control: 'boolean',
      },
      loading: {
        name: 'Loading',
        control: 'boolean',
      },
      error: {
        name: 'Error Message',
        control: 'text',
      },
      confirmText: {
        name: 'Confirmation Button Text',
        control: 'text',
        table: {
          category: 'Controls',
          subcategory: 'Confirmation',
        },
      },
      confirmDisabled: {
        name: 'Disable Confirmation',
        control: 'boolean',
        table: {
          category: 'Controls',
          subcategory: 'Confirmation',
        },
      },
      hideConfirm: {
        name: 'Hide Confirmation',
        control: 'boolean',
        table: {
          category: 'Controls',
          subcategory: 'Confirmation',
        },
      },
      confirmType: {
        name: 'Confirmation Button Type',
        control: 'select',
        options: ['primary', 'secondary', 'destructive', 'ghost'],
        table: {
          category: 'Controls',
          subcategory: 'Confirmation',
        },
      },
      cancelText: {
        name: 'Cancel Button Text',
        control: 'text',
        table: {
          category: 'Controls',
          subcategory: 'Cancellation',
        },
      },
      hightlightNav: {
        name: 'Highlight Navigation',
        control: 'boolean',
      },
    },
  });
</script>

<script lang="ts">
  import { action } from '@storybook/addon-actions';

  setTemplate(template);
</script>

{#snippet template({
  cancelText,
  confirmText,
  open,
  ...args
}: Args<typeof Story>)}
  <Modal
    id="modal"
    confirmModal={action('confirm')}
    cancelModal={action('cancel')}
    {cancelText}
    {confirmText}
    {open}
    {...args}
  >
    {#snippet modal_title()}
      <h3>Modal Title</h3>
    {/snippet}
    {#snippet content()}
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.
        Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies
        sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius
        a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy
        molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat.
        Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium
        a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra
        tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede.
        Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit
        sodales. Vestibulum ante ipsum primis in faucibus orci luctus et
        ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede
        pellentesque fermentum. Maecenas adipiscing ante non diam sodales
        hendrerit.
      </p>
    {/snippet}
  </Modal>
{/snippet}

<Story name="Default" />

<Story name="With Error" args={{ error: 'This is an error message.' }} />

<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import Modal from './modal.svelte';

  export const meta = {
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

      toggleModal: { table: { disable: true } },
    },
  } satisfies Meta<Modal>;
</script>

<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
  <Modal
    id="modal"
    on:confirmModal={action('confirm')}
    on:cancelModal={action('cancel')}
    {...args}
  >
    <h3 slot="title">Modal Title</h3>
    <p slot="content">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.
      Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies
      sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a,
      semper congue, euismod non, mi. Proin porttitor, orci nec nonummy
      molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat.
      Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a,
      enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor.
      Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent
      blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales.
      Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere
      cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque
      fermentum. Maecenas adipiscing ante non diam sodales hendrerit.
    </p>
  </Modal>
</Template>

<Story name="Default" />

<Story name="With Error" args={{ error: 'This is an error message.' }} />

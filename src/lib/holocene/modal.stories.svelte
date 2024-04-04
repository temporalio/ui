<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Meta, Story } from '@storybook/addon-svelte-csf';

  import Modal from './modal.svelte';
</script>

<Meta
  title="Modal"
  component={Modal}
  argTypes={{
    open: {
      control: 'boolean',
    },
    confirmText: { control: 'text' },
    cancelText: { control: 'text' },
    id: { control: 'text' },
    confirmType: {
      control: 'select',
      options: ['primary', 'secondary', 'destructive', 'ghost'],
    },
  }}
/>

<Story
  name="modal"
  args={{
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmType: 'destructive',
    open: false,
  }}
  let:args
>
  <Modal
    id="basic-modal"
    on:confirmModal={action('confirm')}
    on:cancelModal={action('cancel')}
    {...args}
  >
    <h3 slot="title">Delete User</h3>
    <p slot="content">
      Are you sure you want to delete <strong>tobias@temporal.io</strong>?
    </p>
  </Modal>
</Story>

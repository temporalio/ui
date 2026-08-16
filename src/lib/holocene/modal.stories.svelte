<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { action } from 'storybook/actions';
  import { expect, userEvent, waitFor, within } from 'storybook/test';
  import type { ComponentProps } from 'svelte';

  import {
    redesignForcedColorsParameters,
    redesignVisualParameters,
  } from '../../../.storybook/visual-modes';

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
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof Modal>)}
  <Modal
    {...args}
    id="modal"
    onConfirmModal={action('confirm')}
    onCancelModal={action('cancel')}
  >
    {#snippet titleSnippet()}
      <h3>Confirm workflow action</h3>
    {/snippet}
    {#snippet content()}
      <p>
        This action updates
        <span class="font-mono">customer-order-reconciliation</span>
        immediately. Review the current execution state before continuing.
      </p>
      <p class="mt-2 text-secondary">
        Workflow history remains available for diagnosis after the action
        completes.
      </p>
    {/snippet}
  </Modal>
{/snippet}

<Story name="Default" parameters={redesignVisualParameters} />

<Story name="With Error" args={{ error: 'This is an error message.' }} />

<Story name="Loading" args={{ loading: true }} />

<Story name="Confirm Disabled" args={{ confirmDisabled: true }} />

<Story
  name="Long Action Labels"
  args={{
    confirmText: 'Terminate workflow and all child executions',
    cancelText: 'Keep workflow running',
  }}
/>

<Story
  name="Keyboard and Hover States"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = canvas.getByRole('dialog');
    const [closeButton, cancelButton] = canvas.getAllByRole('button', {
      name: 'Cancel',
    });
    const confirmButton = canvas.getByTestId('confirm-modal-button');

    await waitFor(() => expect(dialog).toHaveFocus());
    await userEvent.tab();
    expect(closeButton).toHaveFocus();
    await userEvent.tab();
    expect(cancelButton).toHaveFocus();
    await userEvent.hover(confirmButton);
  }}
/>

<Story
  name="Forced Colors"
  args={{
    confirmType: 'destructive',
    error: 'The workflow state changed. Review it before continuing.',
  }}
  parameters={redesignForcedColorsParameters}
/>

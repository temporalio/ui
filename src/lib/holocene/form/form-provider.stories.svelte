<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import Form from './form-provider.svelte';

  export const meta = {
    title: 'Form/Form',
    component: Form,
  } satisfies Meta<Form>;
</script>

<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Story } from '@storybook/addon-svelte-csf';

  import Button from '../button.svelte';
  import Input from '../input/input.svelte';

  // Form key
  const SIMPLE_FORM = Symbol('simple-form');

  // Storybook action for form submission
  const onFormSubmit = action('form-submitted');

  // Demo submission handler
  function handleSubmit(data: Record<string, unknown>) {
    // Send to Storybook actions
    onFormSubmit(data);

    console.log('Form submitted:', data);
  }
</script>

<Story name="Simple Form">
  <div class="max-w-md">
    <h3 class="mb-4 text-lg font-semibold">Simple Form</h3>
    <Form
      formKey={SIMPLE_FORM}
      onUpdate={handleSubmit}
      defaultValues={{ name: '' }}
    >
      <div class="space-y-4">
        <Input
          id="name"
          value=""
          label="Name"
          placeholder="Enter your name"
          required
        />

        <Button type="submit" variant="primary">Submit</Button>
      </div>
    </Form>
  </div>
</Story>

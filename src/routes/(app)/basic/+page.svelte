<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import { Form, type OnErrorParams } from '$lib/holocene/form';
  import Input from '$lib/holocene/input/input.svelte';

  let defaultValues = { username: 'johndoe' };

  async function onUpdate(values: Record<string, unknown>) {
    console.log('Form submitted with values:', values);
    return 'Form submitted successfully';
  }

  function onError(event: OnErrorParams) {
    console.error('Custom error handler:', event);
    // Custom error handling logic here
  }

  const config = { onUpdate, onError, defaultValues };
</script>

<Form {config}>
  <Input name="username" type="text" label="Username" />

  <Button type="submit">Submit</Button>
</Form>

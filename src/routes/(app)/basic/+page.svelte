<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import { Form } from '$lib/holocene/form';
  import Input from '$lib/holocene/input/input.svelte';

  let defaultValues = { username: 'johndoe' };

  async function onUpdate(values: Record<string, unknown>) {
    console.log('Form submitted with values:', values);
    return 'Form submitted successfully';
  }

  const config = { onUpdate, defaultValues };
</script>

<Form {config}>
  <Input name="username" type="text" label="Username" />

  <Button type="submit">Submit</Button>
</Form>

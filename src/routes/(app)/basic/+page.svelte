<script lang="ts">
  import { z } from 'zod';

  import Button from '$lib/holocene/button.svelte';
  import { Form, type SPAFormConfig } from '$lib/holocene/form';
  import FormInput from '$lib/holocene/form/form-input.svelte';

  const userSchema = z.object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be less than 20 characters')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores',
      ),
    email: z
      .string()
      .email('Please enter a valid email address')
      .min(1, 'Email is required'),
  });

  const config: SPAFormConfig = {
    type: 'spa',
    schema: userSchema,
    defaultValues: {
      username: 'johndoe',
      email: 'john@example.com',
    },
    onUpdate: async ({ form }) => {
      console.log('Form submitted with values:', form);
    },
    onError: async ({ message }) => {
      console.error('Form submission error:', message);
    },
  };
</script>

<Form {config}>
  <FormInput name="username" type="text" label="Username" />
  <FormInput name="email" type="email" label="Email" />

  <Button type="submit">Submit</Button>
</Form>

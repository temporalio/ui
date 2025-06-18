<script lang="ts" module>
  import { action } from '@storybook/addon-actions';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { z } from 'zod';

  import type { OnErrorParams } from './types';
  import Button from '../button.svelte';
  import Input from '../input/input.svelte';

  import Form from './context/form-provider.svelte';

  const defaultValues = { username: 'johndoe' };

  const onUpdate = async (values: Record<string, unknown>) => {
    action('submitted')(values);
    return 'Form submitted successfully';
  };

  const config = {
    type: 'spa' as const,
    defaultValues,
    onUpdate,
  };

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

  const validationConfig = {
    type: 'spa' as const,
    schema: userSchema,
    defaultValues: {
      username: 'johndoe',
      email: 'john@example.com',
    },
    onUpdate: async ({ form }: { form: Record<string, unknown> }) => {
      // for some reason this is never fired insdie storybook but is fired in
      // any other component.
      action('form-submitted')(form);

      return 'Form submitted successfully';
    },
    onError: async ({ message }: { message?: string }) => {
      action('form-error')(message);
    },
  };

  const advancedConfig = {
    type: 'spa' as const,
    schema: userSchema,
    defaultValues: {
      username: '',
      email: '',
    },
    onUpdate: async ({ form }: { form: Record<string, unknown> }) => {
      action('form-submitted')(form);
      // Simulate API call with delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return 'User created successfully!';
    },
    onError: async ({ result, message }: OnErrorParams) => {
      action('form-error')({ result, message });
      // Custom error handling logic would go here
    },
    options: {
      resetForm: true,
      dataType: 'json' as const,
    },
  };

  const { Story } = defineMeta({
    title: 'Forms/Form',
    tags: ['autodocs', 'notest'],
    args: {
      config,
    },
  });
</script>

<Story name="Basic Form">
  {#snippet children(args)}
    <Form config={args.config}>
      <Input name="username" type="text" label="Username" />
      <Button type="submit">Submit</Button>
    </Form>
  {/snippet}
</Story>

<Story name="With Validation" args={{ config: validationConfig }}>
  {#snippet children(args)}
    <Form config={args.config}>
      <Input name="username" type="text" label="Username" />
      <Input name="email" type="email" label="Email" />
      <Button type="submit">Submit</Button>
    </Form>
  {/snippet}
</Story>

<Story name="Advanced Options" args={{ config: advancedConfig }}>
  {#snippet children(args)}
    <Form config={args.config}>
      <Input name="username" type="text" label="Username" />
      <Input name="email" type="email" label="Email" />
      <Button type="submit">Submit</Button>
    </Form>
  {/snippet}
</Story>

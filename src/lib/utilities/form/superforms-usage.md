# SuperForms Usage Guide

This guide demonstrates how to use SuperForms directly in this codebase, both with our minimal wrapper and with raw SuperForms.

## Installation

SuperForms is already installed in this project. The main dependencies are:

- `sveltekit-superforms` - The core library
- `zod` - For schema validation

## Option 1: Using the Minimal Wrapper

We provide a simple `createSPAForm` wrapper that sets up SuperForms with SPA defaults.

```typescript
import { createSPAForm } from '$lib/utilities/form/create-spa-form';
import { z } from 'zod';

// Define your schema
const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email'),
});

// Create the form
const { form, errors, constraints, enhance } = createSPAForm({
  schema: userSchema,
  defaultValues: {
    username: '',
    email: '',
  },
  options: {
    onUpdate: async ({ form }) => {
      // Handle form submission
      console.log('Form submitted:', form);
      // Make API call here
    },
    onError: async ({ result }) => {
      console.error('Form error:', result);
    },
    resetForm: true,
  },
});
```

```svelte
<!-- In your Svelte component -->
<script lang="ts">
  import { createSPAForm } from '$lib/utilities/form/create-spa-form';
  import { z } from 'zod';
  import Input from '$lib/holocene/input/input.svelte';
  import Button from '$lib/holocene/button.svelte';

  const userSchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
  });

  const { form, errors, constraints, enhance } = createSPAForm({
    schema: userSchema,
    defaultValues: { username: '', email: '' },
    options: {
      onUpdate: async ({ form }) => {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      },
    },
  });
</script>

<form use:enhance>
  <Input
    bind:value={$form.username}
    name="username"
    label="Username"
    error={$errors.username?.[0]}
    {...$constraints.username}
  />

  <Input
    bind:value={$form.email}
    name="email"
    type="email"
    label="Email"
    error={$errors.email?.[0]}
    {...$constraints.email}
  />

  <Button type="submit">Submit</Button>
</form>
```

## Option 2: Raw SuperForms Usage

For more control, you can use SuperForms directly:

```typescript
import { superForm } from 'sveltekit-superforms';
import { zodClient } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().min(18, 'Must be 18 or older'),
});

const { form, errors, constraints, enhance, submitting } = superForm(
  {},
  {
    SPA: true,
    validators: zodClient(schema),
    dataType: 'json',
    resetForm: false,

    onUpdate: async ({ form }) => {
      if (!form.valid) return;

      // Custom submission logic
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.data),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      // Handle success
      console.log('Success!');
    },

    onError: async ({ result }) => {
      console.error('Form error:', result);
    },
  },
);
```

## Common Patterns

### 1. Basic Form with Validation

```svelte
<script lang="ts">
  import { createSPAForm } from '$lib/utilities/form/create-spa-form';
  import { z } from 'zod';

  const schema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  });

  const { form, errors, enhance } = createSPAForm({
    schema,
    defaultValues: { email: '', password: '' },
    options: {
      onUpdate: async ({ form }) => {
        // Login logic
        await loginUser(form);
      },
    },
  });
</script>

<form use:enhance>
  <input bind:value={$form.email} name="email" type="email" />
  {#if $errors.email}
    <span class="error">{$errors.email[0]}</span>
  {/if}

  <input bind:value={$form.password} name="password" type="password" />
  {#if $errors.password}
    <span class="error">{$errors.password[0]}</span>
  {/if}

  <button type="submit">Login</button>
</form>
```

### 2. Form with Loading State

```svelte
<script lang="ts">
  import { createSPAForm } from '$lib/utilities/form/create-spa-form';

  const { form, enhance, submitting } = createSPAForm({
    defaultValues: { name: '' },
    options: {
      onUpdate: async ({ form }) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));
      },
    },
  });
</script>

<form use:enhance>
  <input bind:value={$form.name} name="name" />
  <button type="submit" disabled={$submitting}>
    {$submitting ? 'Submitting...' : 'Submit'}
  </button>
</form>
```

### 3. Form with Custom Error Handling

```svelte
<script lang="ts">
  import { createSPAForm } from '$lib/utilities/form/create-spa-form';

  const { form, enhance, message } = createSPAForm({
    defaultValues: { data: '' },
    options: {
      onUpdate: async ({ form }) => {
        const response = await fetch('/api/save', {
          method: 'POST',
          body: JSON.stringify(form),
        });

        if (!response.ok) {
          throw new Error('Save failed');
        }

        return 'Data saved successfully!';
      },
      onError: async ({ result }) => {
        console.error('Save error:', result);
      },
    },
  });
</script>

<form use:enhance>
  <input bind:value={$form.data} name="data" />
  <button type="submit">Save</button>

  {#if $message}
    <div class="success">{$message}</div>
  {/if}
</form>
```

### 4. Complex Form with Nested Data

```typescript
const complexSchema = z.object({
  user: z.object({
    name: z.string().min(1),
    email: z.string().email(),
  }),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    notifications: z.boolean(),
  }),
  tags: z.array(z.string()),
});

const { form, errors, enhance } = createSPAForm({
  schema: complexSchema,
  defaultValues: {
    user: { name: '', email: '' },
    preferences: { theme: 'light', notifications: true },
    tags: [],
  },
  options: {
    onUpdate: async ({ form }) => {
      // Handle complex form submission
    },
  },
});
```

## Best Practices

1. **Always use `use:enhance`** on your form elements
2. **Bind form values** with `bind:value={$form.fieldName}`
3. **Handle errors** by checking `$errors.fieldName`
4. **Use constraints** for HTML validation: `{...$constraints.fieldName}`
5. **Check submitting state** for loading indicators: `$submitting`
6. **Validate on client** but always validate on server for security

## Resources

- [SuperForms Documentation](https://superforms.rocks/)
- [Zod Documentation](https://zod.dev/)
- [SvelteKit Forms](https://kit.svelte.dev/docs/form-actions)

# Form System Usage Examples

## SPA Form Usage

### Basic SPA Form

```typescript
// Component script
import { FormProvider, type SPAFormConfig } from '$lib/holocene/form';
import { z } from 'zod';

const formConfig: SPAFormConfig = {
  type: 'spa',
  schema: z.object({
    email: z.string().email(),
    name: z.string().min(1),
  }),
  defaultValues: { email: '', name: '' },
  onUpdate: async ({ form }) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(form.data),
    });
    return response.json();
  },
};
```

```svelte
<!-- Component template -->
<FormProvider config={formConfig}>
  <Input name="email" label="Email" />
  <Input name="name" label="Name" />
  <Button type="submit">Submit</Button>
</FormProvider>
```

## Server Form Usage

### Load Function (Required)

```typescript
// +page.server.ts
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

export const load = async () => {
  const form = await superValidate(zod(userSchema));
  return { form };
};

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod(userSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    // Handle form submission
    await createUser(form.data);
    return { form };
  },
};
```

### Component Usage

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import { FormProvider, type ServerFormConfig } from '$lib/holocene/form';

  let { data } = $props();

  const formConfig: ServerFormConfig = {
    type: 'server',
    data: data.form, // SuperValidated data from load function
    onError: async ({ message }) => {
      console.error('Server validation error:', message);
    },
  };
</script>

<FormProvider config={formConfig}>
  <Input name="email" label="Email" />
  <Input name="name" label="Name" />
  <Button type="submit">Submit</Button>
</FormProvider>
```

## Type Safety Examples

### Discriminated Union Benefits

```typescript
function handleFormConfig(config: FormConfig) {
  if (config.type === 'spa') {
    // TypeScript knows this is SPAFormConfig
    console.log(config.onUpdate); // ✅ Available
    console.log(config.data); // ❌ Type error - not available on SPA
  } else {
    // TypeScript knows this is ServerFormConfig
    console.log(config.data); // ✅ Available
    console.log(config.onUpdate); // ❌ Type error - not available on Server
  }
}
```

### Factory Function Usage

```typescript
import { createSPAForm, createServerForm } from '$lib/holocene/form';

// Direct factory usage for advanced scenarios
const spaContext = createSPAForm({
  type: 'spa',
  onUpdate: async ({ form }) => {
    /* ... */
  },
});

const serverContext = createServerForm({
  type: 'server',
  data: formData,
});
```

## Advanced Usage

### Custom Error Handling

```typescript
const formConfig: SPAFormConfig = {
  type: 'spa',
  schema: userSchema,
  defaultValues: {},
  onUpdate: async ({ form }) => {
    // Form submission logic
    return await submitToAPI(form.data);
  },
  onError: async ({ result, message }) => {
    // Custom error handling based on error type
    if (result.error?.code === 'VALIDATION_ERROR') {
      // Handle validation errors
      showValidationErrors(result.error.fields);
    } else if (result.error?.code === 'NETWORK_ERROR') {
      // Handle network errors
      showRetryOption();
    } else {
      // Fallback error handling
      console.error('Unexpected error:', message);
    }
  },
};
```

### Form Options Configuration

```typescript
const formConfig: SPAFormConfig = {
  type: 'spa',
  schema: userSchema,
  defaultValues: {},
  onUpdate: async ({ form }) => {
    /* ... */
  },
  options: {
    resetForm: true, // Reset form after successful submission
    dataType: 'json', // or 'form' for FormData (file uploads)
    invalidateAll: false, // Control SvelteKit invalidation
  },
};
```

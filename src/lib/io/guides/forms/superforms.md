# Forms

Building forms with SuperForms and schema validation.

Forms use [SuperForms](https://superforms.rocks/) in SPA mode with a Zod
schema. Call `superForm` directly. There is no wrapper.

```ts
import { superForm } from 'sveltekit-superforms';
import { zodClient } from 'sveltekit-superforms/adapters';
import { z } from 'zod/v3';
```

Import Zod from `zod/v3`. The `zodClient` adapter expects a Zod 3 schema.

## Basic form

Define a schema, pass the starting values and options to `superForm`, and add
`use:enhance` to the form. Show each field's first error with the Holocene
`Input` props `error` and `hintText`.

```svelte
<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { z } from 'zod/v3';

  import Input from '$lib/holocene/input/input.svelte';
  import { Button } from '$lib/io/button';

  const schema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Enter a valid email'),
  });

  const { form, errors, constraints, enhance, submitting } = superForm(
    { username: '', email: '' },
    {
      SPA: true,
      validators: zodClient(schema),
      onUpdate: async ({ form }) => {
        if (!form.valid) return;
        await saveUser(form.data);
      },
    },
  );
</script>

<form use:enhance class="flex flex-col gap-4">
  <Input
    id="username"
    label="Username"
    bind:value={$form.username}
    error={!!$errors.username}
    hintText={$errors.username?.[0]}
    {...$constraints.username}
  />
  <Input
    id="email"
    type="email"
    label="Email"
    bind:value={$form.email}
    error={!!$errors.email}
    hintText={$errors.email?.[0]}
    {...$constraints.email}
  />
  <Button type="submit" isLoading={$submitting}>Save</Button>
</form>
```

## Options

| Option             | Use                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------- |
| `SPA: true`        | Always. Forms submit in the browser, not to a SvelteKit form action.                   |
| `validators`       | Always. Pass `zodClient(schema)`.                                                      |
| `onUpdate`         | Runs on submit. Check `form.valid` before you send anything.                           |
| `dataType: 'json'` | When the data has nested objects, arrays, or numbers you don't want posted as strings. |
| `resetForm: false` | When the form stays on screen after saving and should keep the saved values.           |
| `onError`          | When you need to react to an error thrown in `onUpdate`, such as logging it.           |

## Patterns

### Loading state

`$submitting` is true while `onUpdate` runs. Pass it to the IO `Button` prop
`isLoading`, which shows a spinner and blocks repeat submits.

```svelte
<Button type="submit" isLoading={$submitting}>Save</Button>
```

### Success message

Set `form.message` in `onUpdate`, and show `$message`.

```svelte
<script lang="ts">
  const { form, enhance, message } = superForm(
    { name: '' },
    {
      SPA: true,
      validators: zodClient(schema),
      resetForm: false,
      onUpdate: async ({ form }) => {
        if (!form.valid) return;
        await saveName(form.data);
        form.message = 'Saved';
      },
    },
  );
</script>

{#if $message}
  <p class="text-success">{$message}</p>
{/if}
```

### Errors from the API

When the API rejects a value, attach the error to its field with `setError`,
so it shows next to the input like a validation error.

```ts
import { setError, superForm } from 'sveltekit-superforms';

const { form, errors, enhance } = superForm(
  { namespace: '' },
  {
    SPA: true,
    validators: zodClient(schema),
    onUpdate: async ({ form }) => {
      if (!form.valid) return;
      try {
        await createNamespace(form.data);
      } catch {
        setError(form, 'namespace', 'This namespace already exists');
      }
    },
  },
);
```

### Rules across fields

Use `refine` on the schema, and set `path` to the field that should show the
error.

```ts
const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
```

### Nested data

Set `dataType: 'json'` for nested objects and arrays. Bind each field by its
path.

```svelte
<script lang="ts">
  const schema = z.object({
    user: z.object({
      name: z.string().min(1, 'Name is required'),
    }),
    tags: z.array(z.string()),
  });

  const { form, errors, enhance } = superForm(
    { user: { name: '' }, tags: [] },
    {
      SPA: true,
      dataType: 'json',
      validators: zodClient(schema),
      onUpdate: async ({ form }) => {
        if (!form.valid) return;
        await save(form.data);
      },
    },
  );
</script>

<Input
  id="name"
  label="Name"
  bind:value={$form.user.name}
  error={!!$errors.user?.name}
  hintText={$errors.user?.name?.[0]}
/>
```

## Resources

- [SuperForms documentation](https://superforms.rocks/)
- [SuperForms in SPA mode](https://superforms.rocks/concepts/spa)
- [Zod documentation](https://zod.dev/)

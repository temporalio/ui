<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { z } from 'zod';

  import Button from '$lib/anthropocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import NumberInput from '$lib/holocene/input/number-input.svelte';

  // Basic form example
  const basicSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Please enter a valid email'),
  });

  const {
    form: basicForm,
    errors: basicErrors,
    constraints: basicConstraints,
    enhance: basicEnhance,
  } = superForm(
    { username: 'johndoe', email: 'john@example.com' },
    {
      SPA: true,
      validators: zodClient(basicSchema),
      resetForm: false,
      onUpdate: async ({ form }) => {
        action('form-submitted')(form);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      },
      onError: async ({ result }) => {
        action('form-error')(result);
      },
    },
  );

  // Raw SuperForms example
  const rawSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    age: z.number().min(18, 'Must be 18 or older').max(120, 'Invalid age'),
  });

  const {
    form: rawForm,
    errors: rawErrors,
    constraints: rawConstraints,
    enhance: rawEnhance,
    submitting: rawSubmitting,
  } = superForm(
    { name: '', age: 25 },
    {
      SPA: true,
      validators: zodClient(rawSchema),
      dataType: 'json',

      onUpdate: async ({ form }) => {
        if (!form.valid) return;
        action('raw-form-submitted')(form.data);
        await new Promise((resolve) => setTimeout(resolve, 1500));
      },

      onError: async ({ result }) => {
        action('raw-form-error')(result);
      },
    },
  );

  // Extract number constraints for NumberInput
  const ageConstraints = $derived({
    min:
      typeof $rawConstraints.age?.min === 'number'
        ? $rawConstraints.age.min
        : undefined,
    max:
      typeof $rawConstraints.age?.max === 'number'
        ? $rawConstraints.age.max
        : undefined,
    required: $rawConstraints.age?.required,
  });

  // Loading form example
  const loadingSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters'),
  });

  const {
    form: loadingForm,
    errors: loadingErrors,
    enhance: loadingEnhance,
    submitting: loadingSubmitting,
    message: loadingMessage,
  } = superForm(
    { title: '', description: '' },
    {
      SPA: true,
      validators: zodClient(loadingSchema),
      resetForm: false,
      onUpdate: async ({ form }) => {
        action('loading-form-submitted')(form);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return 'Form submitted successfully!';
      },
      onError: async ({ result }) => {
        action('loading-form-error')(result);
      },
    },
  );

  // Password validation example
  const passwordSchema = z
    .object({
      password: z.string().min(8, 'Password must be at least 8 characters'),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    });

  const {
    form: passwordForm,
    errors: passwordErrors,
    enhance: passwordEnhance,
    allErrors: passwordAllErrors,
  } = superForm(
    { password: '', confirmPassword: '' },
    {
      SPA: true,
      validators: zodClient(passwordSchema),

      onUpdate: async ({ form }) => {
        if (!form.valid) return;
        action('password-form-submitted')(form.data);
      },
    },
  );
</script>

<div class="space-y-8">
  <section>
    <h2 class="mb-4 text-xl font-semibold">Basic Form with Wrapper</h2>
    <form use:basicEnhance class="max-w-md space-y-4">
      <Input
        id="username"
        label="Username"
        bind:value={$basicForm.username}
        error={!!$basicErrors.username?.[0]}
        hintText={$basicErrors.username?.[0]}
        {...$basicConstraints.username}
      />

      <Input
        id="email"
        bind:value={$basicForm.email}
        type="email"
        label="Email"
        error={!!$basicErrors.email?.[0]}
        hintText={$basicErrors.email?.[0]}
        {...$basicConstraints.email}
      />

      <Button type="submit">Submit with Wrapper</Button>
    </form>
  </section>

  <section>
    <h2 class="mb-4 text-xl font-semibold">Raw SuperForms Usage</h2>
    <form use:rawEnhance class="max-w-md space-y-4">
      <Input
        id="name"
        bind:value={$rawForm.name}
        label="Full Name"
        error={!!$rawErrors.name?.[0]}
        hintText={$rawErrors.name?.[0]}
        {...$rawConstraints.name}
      />

      <NumberInput
        id="age"
        bind:value={$rawForm.age}
        name="age"
        label="Age"
        hintText={$rawErrors.age?.[0]}
        {...ageConstraints}
      />

      <Button type="submit" disabled={$rawSubmitting}>
        {$rawSubmitting ? 'Submitting...' : 'Submit Raw Form'}
      </Button>
    </form>
  </section>

  <section>
    <h2 class="mb-4 text-xl font-semibold">Form with Loading and Messages</h2>
    <form use:loadingEnhance class="max-w-md space-y-4">
      <Input
        id="title"
        bind:value={$loadingForm.title}
        name="title"
        label="Title"
        error={!!$loadingErrors.title?.[0]}
        hintText={$loadingErrors.title?.[0]}
      />

      <div class="space-y-2">
        <label for="description" class="block text-sm font-medium"
          >Description</label
        >
        <textarea
          bind:value={$loadingForm.description}
          name="description"
          id="description"
          rows="4"
          class="border-gray-300 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
        {#if $loadingErrors.description}
          <span class="text-sm text-red-500"
            >{$loadingErrors.description[0]}</span
          >
        {/if}
      </div>

      <Button type="submit" disabled={$loadingSubmitting}>
        {$loadingSubmitting ? 'Submitting...' : 'Submit'}
      </Button>

      {#if $loadingMessage}
        <div
          class="rounded border border-green-300 bg-green-100 p-3 text-green-700"
        >
          {$loadingMessage}
        </div>
      {/if}
    </form>
  </section>

  <section>
    <h2 class="mb-4 text-xl font-semibold">Form with Custom Validation</h2>
    <form use:passwordEnhance class="max-w-md space-y-4">
      <Input
        id="password"
        bind:value={$passwordForm.password}
        name="password"
        type="password"
        label="Password"
        error={!!$passwordErrors.password?.[0]}
        hintText={$passwordErrors.password?.[0]}
      />

      <Input
        id="confirmPassword"
        bind:value={$passwordForm.confirmPassword}
        name="confirmPassword"
        type="password"
        label="Confirm Password"
        error={!!$passwordErrors.confirmPassword?.[0]}
        hintText={$passwordErrors.confirmPassword?.[0]}
      />

      <Button type="submit">Set Password</Button>

      {#if $passwordAllErrors.length > 0}
        <div class="rounded border border-red-300 bg-red-100 p-3 text-red-700">
          <p class="font-medium">Please fix the following errors:</p>
          <ul class="mt-2 list-inside list-disc">
            {#each $passwordAllErrors as error}
              <li>{error.messages.join(', ')}</li>
            {/each}
          </ul>
        </div>
      {/if}
    </form>
  </section>
</div>

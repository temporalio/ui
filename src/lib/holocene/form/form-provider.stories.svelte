<script lang="ts" module>
  import { action } from '@storybook/addon-actions';
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import Button from '../button.svelte';
  import Input from '../input/input.svelte';

  import Form from './form-provider.svelte';

  const defaultValues = { username: 'johndoe' };

  const { Story } = defineMeta({
    title: 'Forms/Form',
    tags: ['autodocs', 'notest'],
    args: {
      defaultValues,
      onUpdate: async (values: Record<string, unknown>) => {
        action('submitted')(values);
        return 'Form submitted successfully';
      },
    },
  });
</script>

<Story name="Basic Form">
  {#snippet children(args)}
    <Form onUpdate={args.onUpdate} defaultValues={args.defaultValues}>
      <Input name="username" type="text" label="Username" />
      <Button type="submit">Submit</Button>
    </Form>
  {/snippet}
</Story>

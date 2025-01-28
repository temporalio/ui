<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
  } from '@storybook/addon-svelte-csf';

  const { Story } = defineMeta({
    title: 'File Input',
    component: FileInput,
    args: {
      id: 'file-input',
      accept: '.json',
    },
    argTypes: {
      id: { control: 'text' },
      accept: { control: 'text' },
    },
  });
</script>

<script lang="ts">
  import FileInput from './file-input.svelte';

  setTemplate(template);
</script>

{#snippet template({ id, ...args }: Args<typeof Story>)}
  <FileInput {id} {...args} onUpload={() => {}} />
{/snippet}

<Story name="Default" />

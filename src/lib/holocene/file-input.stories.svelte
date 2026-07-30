<svelte:options runes />

<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import FileInput from './file-input.svelte';

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

<Story name="Default" />

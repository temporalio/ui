<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
  } from '@storybook/addon-svelte-csf';

  import CodeBlock from '$lib/holocene/code-block.svelte';

  const { Story } = defineMeta({
    title: 'Code Block',
    args: {
      editable: false,
      inline: false,
      language: 'json',
      copyable: false,
      label: 'JSON content',
    },
    argTypes: {
      editable: {
        control: 'boolean',
        table: { category: 'Properties' },
      },
      inline: {
        control: 'boolean',
        table: { category: 'Properties' },
      },
      copyable: {
        control: 'boolean',
        table: { category: 'Properties' },
      },
      content: {
        control: 'text',
        table: { category: 'Content' },
      },
      language: {
        control: 'select',
        options: ['json', 'shell', 'text'],
        table: { category: 'Content' },
      },
      minHeight: {
        control: { type: 'number', min: 0, max: 9999, step: 1 },
        table: { category: 'Size' },
      },
      maxHeight: {
        control: { type: 'number', min: 0, max: 9999, step: 1 },
        table: { category: 'Size' },
      },
      copyIconTitle: {
        control: 'text',
        table: { category: 'Copy Icon' },
      },
      copySuccessIconTitle: {
        control: 'text',
        table: { category: 'Copy Icon' },
      },
    },
  });
</script>

<script lang="ts">
  import { action } from '@storybook/addon-actions';

  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  setTemplate(template);
</script>

{#snippet template({ content, ...args }: Args<typeof Story>)}
  <CodeBlock {content} {...args} change={action('change')} />
{/snippet}

<Story
  name="Default"
  args={{
    content: stringifyWithBigInt({ hello: 'world' }, null, 2),
  }}
/>

<Story
  name="Editable"
  args={{
    editable: true,
    content: stringifyWithBigInt({ hello: 'world' }, null, 2),
  }}
/>

<Story
  name="Inline"
  args={{
    inline: true,
    content: stringifyWithBigInt({ hello: 'world' }, null, 2),
  }}
/>

<Story
  name="Copyable"
  args={{
    copyable: true,
    content: stringifyWithBigInt({ hello: 'world' }, null, 2),
    copyIconTitle: 'Click to copy content',
    copySuccessIconTitle: 'Content copied to clipboard',
  }}
/>

<Story
  name="Minimum Height"
  args={{
    minHeight: 400,
    content: stringifyWithBigInt({ hello: 'world' }, null, 2),
  }}
/>

<Story
  name="Maximum Height"
  args={{
    maxHeight: 100,
    content: stringifyWithBigInt(
      Object.getOwnPropertyDescriptors(Array.prototype),
      null,
      2,
    ),
  }}
/>

<Story
  name="Shell"
  args={{
    language: 'shell',
    content: 'echo "Hello, World!"',
  }}
/>

<Story
  name="Text"
  args={{
    language: 'text',
    content: 'Hello, World!',
  }}
/>

<Story
  name="Copyable (Shell)"
  args={{
    language: 'shell',
    copyable: true,
    content: 'echo "Hello, World!"',
    copyIconTitle: 'Click to copy content',
    copySuccessIconTitle: 'Content copied to clipboard',
  }}
/>

<Story
  name="Copyable (Text)"
  args={{
    language: 'text',
    copyable: true,
    content: 'Hello, World!',
    copyIconTitle: 'Click to copy content',
    copySuccessIconTitle: 'Content copied to clipboard',
  }}
/>

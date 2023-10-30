<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  const handleChange = (e) => {
    action('change')(e);
  };
</script>

<Meta
  title="Code Block"
  component={CodeBlock}
  argTypes={{
    language: { control: false },
    class: { control: 'text' },
  }}
/>

<Template id="json" let:args>
  <CodeBlock
    language="json"
    copyIconTitle="Click to copy content"
    copySuccessIconTitle="Content copied to clipboard"
    {...args}
    on:change={handleChange}
  />
</Template>

<Template id="text" let:args>
  <CodeBlock
    language="text"
    copyIconTitle="Click to copy content"
    copySuccessIconTitle="Content copied to clipboard"
    {...args}
    on:change={handleChange}
  />
</Template>

<Story
  template="json"
  name="json code block"
  args={{
    content: stringifyWithBigInt({ foo: 'bar', baz: false, blue: 42 }),
    editable: false,
  }}
/>

<Story
  template="text"
  name="text code block"
  args={{
    content: 'This is the text',
  }}
/>

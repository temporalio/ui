<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { userEvent, within } from 'storybook/test';

  import Editor from './editor.svelte';
  import MarkdownEditor from './markdown-editor.svelte';
  import Preview from './preview.svelte';

  const { Story } = defineMeta({
    title: 'Markdown Editor',
    component: MarkdownEditor,
    subcomponents: { Editor, Preview },
    argTypes: {
      content: { name: 'Content', control: 'text' },
    },
  });
</script>

<!-- preview iframe hits the /render server route, which 404s in Chromatic's static build -->
<Story
  name="default"
  play={async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    const editor = await canvas.findByRole('textbox');
    const previewButton = await canvas.findByText('Preview');

    await step('Edit content', async () => {
      await userEvent.type(
        editor,
        '# this is a title{enter}this is a paragraph.{enter}[[this is a link](https://temporal.io)',
      );
    });

    await step('Preview content', async () => {
      await userEvent.click(previewButton);
      await canvas.findByTitle('output');
    });
  }}
  parameters={{
    // preview iframe hits the /render server route, which 404s in Chromatic's static build
    chromatic: { disable: true },
  }}
/>

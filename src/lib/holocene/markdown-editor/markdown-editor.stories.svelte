<svelte:options runes />

<script lang="ts" module>
  import type { Meta } from '@storybook/svelte';

  export const meta = {
    title: 'Markdown Editor',
    component: MarkdownEditor,
    subcomponents: { Editor, Preview },
    argTypes: {
      content: { name: 'Content', control: 'text' },
    },
  } satisfies Meta;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import type { StoryContext } from '@storybook/svelte';
  import { userEvent, within } from '@storybook/test';

  import Editor from './editor.svelte';
  import MarkdownEditor from './markdown-editor.svelte';
  import Preview from './preview.svelte';

  const play = async ({
    canvasElement,
    step,
  }: {
    canvasElement: HTMLElement;
    step: StoryContext['step'];
  }) => {
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
  };
</script>

<Template let:args>
  <MarkdownEditor {...args} />
</Template>

<!-- preview iframe hits the /render server route, which 404s in Chromatic's static build -->
<Story name="default" {play} parameters={{ chromatic: { disable: true } }} />

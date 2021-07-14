import { storiesOf } from '@storybook/svelte';
import ButtonSimple from '../../src/lib/components/button-test.svelte';
import markdownNotes from './buttons.stories.md';

storiesOf('Buttons | Buttons', module).add(
  'Simple',
  () => ({
    Component: ButtonSimple,
    props: { text: 'Button' },
  }),
  { notes: { markdown: markdownNotes } },
);

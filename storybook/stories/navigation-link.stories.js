import { storiesOf } from '@storybook/svelte';
import NavigationTab from '../../src/lib/components/navigation-link.svelte';

storiesOf('Buttons | Buttons', module)
  //Simple Button
  .add('Simple', () => ({
    Component: NavigationTab,
    props: { text: 'A' },
  }));

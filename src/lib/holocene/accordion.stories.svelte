<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

  import { iconNames } from './icon/paths';

  import Accordion from './accordion.svelte';
</script>

<Meta
  title="Accordion"
  component={Accordion}
  argTypes={{
    id: { control: 'text' },
    title: { control: 'text' },
    icon: { control: 'select', options: iconNames },
    onToggle: { control: false },
  }}
/>

<Template let:args>
  <Accordion {...args} onToggle={action('onToggle')}>
    <p>Accordion Content</p>
  </Accordion>
</Template>

<Story
  name="accordion"
  args={{
    title: 'Accordion Title',
    subtitle: 'Accordion Subtitle',
  }}
/>

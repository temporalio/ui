<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

  import Textarea from './textarea.svelte';
</script>

<Meta
  title="Textarea"
  component={Textarea}
  argTypes={{
    label: { control: 'text' },
    value: { control: 'text' },
    spellcheck: { control: 'boolean' },
    id: { control: 'text' },
  }}
/>

<Template let:args>
  <Textarea
    on:input={action('input')}
    on:blur={action('blue')}
    on:change={action('change')}
    on:focus={action('focus')}
    on:keydown={action('keydown')}
    {...args}
  />
</Template>

<Story
  name="textarea"
  args={{
    id: 'textarea-1',
    disabled: false,
    label: 'Label',
    description: 'Description',
    error: '',
    value: '',
    required: false,
  }}
/>

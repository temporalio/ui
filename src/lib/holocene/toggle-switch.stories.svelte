<script lang="ts">
  import { Meta, Story } from '@storybook/addon-svelte-csf';

  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
</script>

<Meta
  title="Toggle Switch"
  component={ToggleSwitch}
  argTypes={{
    id: { control: 'text' },
    label: { control: 'text' },
    labelPosition: { control: 'radio', options: ['left', 'right'] },
  }}
/>

<Story
  name="toggleswitch"
  args={{
    label: 'Toggle',
    id: 'toggle-1',
    labelHidden: false,
    labelPosition: 'left',
    disabled: false,
  }}
  let:args
>
  <ToggleSwitch label="Toggle Switch" id="toggle-1" {...args} />
</Story>

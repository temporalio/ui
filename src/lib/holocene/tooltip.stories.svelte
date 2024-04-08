<script lang="ts">
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

  import Button from '$lib/holocene/button.svelte';
  import iconNames from '$lib/holocene/icon';
  import Tooltip from '$lib/holocene/tooltip.svelte';
</script>

<Meta
  title="Tooltip"
  component={Tooltip}
  argTypes={{ icon: { control: 'select', options: iconNames } }}
/>

<Template let:args>
  <div class="flex h-screen w-full items-center justify-center">
    <Tooltip {...args}>
      <Button>Hover Here</Button>
    </Tooltip>
  </div>
</Template>

<Story
  name="tooltip"
  args={{
    copyable: false,
    copyIconTitle: 'Click to copy content',
    copySuccessIconTitle: 'Content copied to clipboard',
    top: true,
    text: 'This is a tooltip',
  }}
/>

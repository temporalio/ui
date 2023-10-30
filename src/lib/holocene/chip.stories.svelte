<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

  import Chip from '$lib/holocene/chip.svelte';
</script>

<Meta
  title="Chip"
  component={Chip}
  argTypes={{
    intent: { control: 'select', options: ['warning', 'default'] },
    removeButtonLabel: { control: 'text' },
  }}
/>

<Template let:args>
  <Chip {...args} on:remove={action('remove')} on:click={action('click')}
    >ross.edfort@temporal.io</Chip
  >
</Template>

<Story name="chip" args={{ removeButtonLabel: 'Remove' }} />

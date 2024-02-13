<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Meta, Story } from '@storybook/addon-svelte-csf';

  import IconButton from '$lib/holocene/icon-button.svelte';

  import iconNames from './icon/icon-names';
</script>

<Meta
  title="Icon Button [deprecate me]"
  component={IconButton}
  argTypes={{
    icon: { control: 'select', options: iconNames },
    label: { control: 'text' },
  }}
/>

<Story name="icon button" args={{ label: 'Click Me', icon: 'retry' }} let:args>
  <IconButton {...args} on:click={action('click')} />
</Story>

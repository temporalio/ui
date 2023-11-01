<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

  import Checkbox from '$lib/holocene/checkbox.svelte';
</script>

<Meta
  title="Checkbox"
  component={Checkbox}
  argTypes={{ label: { control: 'text' } }}
/>

<Template let:args>
  <Checkbox
    {...args}
    on:change={action('change')}
    on:click={action('click')}
    on:keypress={action('keypress')}
  />
</Template>

<Story name="checkbox" args={{ label: 'Check Me', onDark: false }} />

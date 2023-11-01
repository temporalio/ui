<script lang="ts">
  import { Meta, Story } from '@storybook/addon-svelte-csf';

  import { iconNames } from '$lib/holocene/icon/paths';

  import ToggleButton from './toggle-button.svelte';
  import ToggleButtons from './toggle-buttons.svelte';

  let activeOption = 'a';
</script>

<Meta
  title="Toggle Button"
  component={ToggleButton}
  argTypes={{
    icon: { control: 'select', options: iconNames },
    group: { control: false },
    base: { control: 'text' },
    href: { control: 'text' },
    label: { control: 'text' },
  }}
/>

<Story name="toggle buttons" let:args>
  <ToggleButtons>
    <ToggleButton
      {...args}
      on:click
      on:click={() => {
        activeOption = 'a';
      }}
      active={activeOption === 'a'}>{args.label ?? 'Option A'}</ToggleButton
    >
    <ToggleButton
      on:click
      on:click={() => {
        activeOption = 'b';
      }}
      active={activeOption === 'b'}>Option B</ToggleButton
    >
    <ToggleButton
      on:click
      on:click={() => {
        activeOption = 'c';
      }}
      active={activeOption === 'c'}>Option C</ToggleButton
    >
  </ToggleButtons>
</Story>

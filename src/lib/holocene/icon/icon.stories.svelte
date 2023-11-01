<script lang="ts">
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

  import { iconNames } from './paths';

  import Icon from './icon.svelte';
</script>

<Meta
  title="Icon"
  component={Icon}
  argTypes={{ name: { control: 'select', options: iconNames } }}
/>

<Template let:args>
  <Icon {...args} />
</Template>

<Story name="icon" args={{ name: 'add', height: 24, width: 24 }} />

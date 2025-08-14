<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import { iconNames } from './';

  import Icon from './icon.svelte';

  export const meta = {
    title: 'Icon',
    component: Icon,
    args: {
      name: 'add',
      height: 24,
      width: 24,
    },
    argTypes: {
      name: {
        name: 'Icon',
        control: 'select',
        options: iconNames,
      },
      height: { name: 'Height', control: 'number' },
      width: { name: 'Width', control: 'number' },
    },
  } satisfies Meta<Icon>;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
  <Icon {...args} />
</Template>

<Story name="Default" args={{ name: 'add', height: 24, width: 24 }} />

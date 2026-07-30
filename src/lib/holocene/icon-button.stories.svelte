<svelte:options runes />

<script lang="ts" module>
  import type { Meta } from '@storybook/svelte';
  import type { ComponentProps } from 'svelte';

  import IconButton from '$lib/holocene/icon-button.svelte';

  import { iconNames } from './icon';

  export const meta = {
    title: 'Icon Button (Deprecated)',
    component: IconButton,
    args: {
      icon: 'close',
      label: 'Click Me',
    },
    argTypes: {
      label: { control: 'text' },
      icon: {
        control: 'select',
        options: iconNames,
      },
    },
  } satisfies Meta<ComponentProps<typeof IconButton>>;
</script>

<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
  <IconButton {...args} onclick={action('click')} />
</Template>

<Story name="Default" />

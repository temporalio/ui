<svelte:options runes />

<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { action } from 'storybook/actions';
  import type { ComponentProps } from 'svelte';

  import IconButton from '$lib/holocene/icon-button.svelte';

  import { iconNames } from './icon';

  const { Story } = defineMeta({
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
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof IconButton>)}
  <IconButton {...args} onclick={action('click')} />
{/snippet}

<Story name="Default" />

<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { action } from 'storybook/actions';
  import type { ComponentProps } from 'svelte';

  import IconButton from '$lib/holocene/icon-button.svelte';
  import * as ioIcons from '$lib/io/icon';

  const iconOptions: Record<string, unknown> = { ...ioIcons };

  const { Story } = defineMeta({
    title: 'Icon Button (Deprecated)',
    component: IconButton,
    args: {
      Icon: ioIcons.IconClose,
      label: 'Click Me',
    },
    argTypes: {
      label: { control: 'text' },
      Icon: {
        control: 'select',
        options: Object.keys(iconOptions),
        mapping: iconOptions,
      },
    },
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof IconButton>)}
  <IconButton {...args} onclick={action('click')} />
{/snippet}

<Story name="Default" />

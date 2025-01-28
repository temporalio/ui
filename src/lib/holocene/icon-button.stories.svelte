<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
  } from '@storybook/addon-svelte-csf';

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
  });
</script>

<script lang="ts">
  import { action } from '@storybook/addon-actions';

  setTemplate(template);
</script>

{#snippet template({ icon, label, ...args }: Args<typeof Story>)}
  <IconButton {icon} {label} {...args} onclick={action('click')} />
{/snippet}

<Story name="Default" />

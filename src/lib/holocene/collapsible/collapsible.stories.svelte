<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import Collapsible from './collapsible.svelte';

  export const meta = {
    title: 'Collapsible',
    component: Collapsible,
    args: {
      label: 'Expand me',
    },

    argTypes: {
      label: { name: 'Label', control: 'text' },
    },
  } satisfies Meta<Collapsible>;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
  <Collapsible label={args.label}>
    <p>This is the content</p>
  </Collapsible>
</Template>

<Story name="Default" />

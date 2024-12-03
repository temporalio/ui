<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import CollapsibleDivider from './collapsible-divider.svelte';

  export const meta = {
    title: 'Collapsible Divider',
    component: CollapsibleDivider,
    args: {
      label: 'Expand me',
    },

    argTypes: {
      label: { name: 'Label', control: 'text' },
    },
  } satisfies Meta<CollapsibleDivider>;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
  <CollapsibleDivider label={args.label}>
    <p>This is the content</p>
  </CollapsibleDivider>
</Template>

<Story name="Default" />

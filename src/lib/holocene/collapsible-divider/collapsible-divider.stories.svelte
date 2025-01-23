<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
  } from '@storybook/addon-svelte-csf';

  import CollapsibleDivider from './collapsible-divider.svelte';

  const { Story } = defineMeta({
    title: 'Collapsible Divider',
    component: CollapsibleDivider,
    args: {
      label: 'Expand me',
    },

    argTypes: {
      label: { name: 'Label', control: 'text' },
    },
  });
</script>

<script lang="ts">
  setTemplate(template);
</script>

{#snippet template(args: Args<typeof Story>)}
  <CollapsibleDivider label={args.label}>
    <p>This is the content</p>
  </CollapsibleDivider>
{/snippet}

<Story name="Default" />

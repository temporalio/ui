<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
  } from '@storybook/addon-svelte-csf';

  import Label from '$lib/holocene/label.svelte';

  const { Story } = defineMeta({
    title: 'Label',
    component: Label,
    args: {
      label: 'Label',
      disabled: false,
      hidden: false,
      required: true,
    },
    argTypes: {
      label: { name: 'Label', control: 'text' },
      disabled: { name: 'Disabled', control: 'boolean' },
      required: { name: 'Required', control: 'boolean' },
      hidden: {
        name: 'Label Hidden',
        control: 'boolean',
        table: { category: 'Accessibility' },
      },
    },
  });
</script>

<script lang="ts">
  setTemplate(template);
</script>

{#snippet template(args: Args<typeof Story>)}
  <Label {...args} />
{/snippet}

<Story name="Default" />

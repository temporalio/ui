<script lang="ts" context="module">
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import type { Meta } from '@storybook/svelte';

  import Label from '$lib/anthropocene/label.svelte';

  export const meta = {
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
  } satisfies Meta<Label>;
</script>

<Template let:args>
  <Label {...args} />
</Template>

<Story name="Default" />

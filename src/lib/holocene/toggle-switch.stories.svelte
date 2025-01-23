<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
    type StoryContext,
  } from '@storybook/addon-svelte-csf';

  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';

  const { Story } = defineMeta({
    title: 'Toggle Switch',
    component: ToggleSwitch,
    args: {
      label: 'Toggle Switch',
      labelPosition: 'right',
      labelHidden: false,
      disabled: false,
      checked: false,
    },
    argTypes: {
      label: { name: 'Label', control: 'text' },
      labelPosition: {
        name: 'Position',
        control: 'radio',
        options: ['left', 'right'],
      },
      labelHidden: { name: 'Label Hidden', control: 'boolean' },
      disabled: { name: 'Disabled', control: 'boolean' },
      checked: {
        name: 'Checked',
        control: 'boolean',
        table: { disable: true },
      },
    },
  });
</script>

<script lang="ts">
  setTemplate(template);
</script>

{#snippet template(
  { label, ...args }: Args<typeof Story>,
  context: StoryContext<typeof Story>,
)}
  <ToggleSwitch {label} {...args} id={context.id} />
{/snippet}

<Story name="Unchecked" />

<Story name="Checked" args={{ checked: true }} />

<Story name="Disabled" args={{ disabled: true }} />

<Story name="Label Hidden" args={{ labelHidden: true }} />

<Story name="Label Left" args={{ labelPosition: 'left' }} />

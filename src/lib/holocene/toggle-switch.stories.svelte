<script lang="ts" module>
  import { defineMeta, type StoryContext } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

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
    render: template,
  });
</script>

{#snippet template(
  args: ComponentProps<typeof ToggleSwitch>,
  context: StoryContext<ComponentProps<typeof ToggleSwitch>>,
)}
  <div class="border border-primary bg-surface-primary p-4 text-primary">
    <ToggleSwitch {...args} id={context.id} />
  </div>
{/snippet}

<Story name="Unchecked" />

<Story name="Checked" args={{ checked: true }} />

<Story name="Disabled" args={{ disabled: true }} />

<Story name="Label Hidden" args={{ labelHidden: true }} />

<Story name="Label Left" args={{ labelPosition: 'left' }} />

<script lang="ts" module>
  import { defineMeta, type StoryContext } from '@storybook/addon-svelte-csf';
  import { expect, userEvent, waitFor, within } from 'storybook/test';
  import type { ComponentProps } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import { iconNames } from '$lib/holocene/icon';
  import Tooltip from '$lib/holocene/tooltip.svelte';

  const { Story } = defineMeta({
    title: 'Tooltip',
    component: Tooltip,
    args: {
      text: 'This is a tooltip',
      show: true,
      hide: false,
    },
    argTypes: {
      text: { name: 'Content', control: 'text' },
      hide: {
        name: 'Hide',
        control: 'boolean',
        if: { arg: 'show', neq: true },
      },
      show: {
        name: 'Show',
        control: 'boolean',
        if: { arg: 'hide', neq: true },
      },
      icon: { name: 'Icon', control: 'select', options: iconNames },
      width: { name: 'Width', control: { type: 'range', min: 0, max: 400 } },
      top: {
        name: 'Top',
        control: 'boolean',
        table: { category: 'Positioning' },
      },
      left: {
        name: 'Left',
        control: 'boolean',
        table: { category: 'Positioning' },
      },
      right: {
        name: 'Right',
        control: 'boolean',
        table: { category: 'Positioning' },
      },
      bottom: {
        name: 'Bottom',
        control: 'boolean',
        table: { category: 'Positioning' },
      },
      topRight: {
        name: 'Top Right',
        control: 'boolean',
        table: { category: 'Positioning' },
      },
      topLeft: {
        name: 'Top Left',
        control: 'boolean',
        table: { category: 'Positioning' },
      },
      bottomRight: {
        name: 'Bottom Right',
        control: 'boolean',
        table: { category: 'Positioning' },
      },
      bottomLeft: {
        name: 'Bottom Left',
        control: 'boolean',
        table: { category: 'Positioning' },
      },
    },
    render: template,
  });
</script>

{#snippet template(
  args: ComponentProps<typeof Tooltip>,
  context: StoryContext<ComponentProps<typeof Tooltip>>,
)}
  <div class="flex h-screen w-full items-center justify-center">
    <Tooltip {...args}>
      <Button>{context.name} Tooltip</Button>
    </Tooltip>
  </div>
{/snippet}

<Story name="Top" args={{ top: true }} />

<Story name="Top with Icon" args={{ top: true, icon: 'trash' }} />

<Story name="Top Right" args={{ topRight: true }} />

<Story name="Top Right with Icon" args={{ topRight: true, icon: 'trash' }} />

<Story name="Top Left" args={{ topLeft: true }} />

<Story name="Top Left with Icon" args={{ topLeft: true, icon: 'trash' }} />

<Story name="Bottom" args={{ bottom: true }} />

<Story name="Bottom with Icon" args={{ bottom: true, icon: 'trash' }} />

<Story name="Bottom Right" args={{ bottomRight: true }} />

<Story
  name="Bottom Right with Icon"
  args={{ bottomRight: true, icon: 'trash' }}
/>

<Story name="Bottom Left" args={{ bottomLeft: true }} />

<Story
  name="Bottom Left with Icon"
  args={{ bottomLeft: true, icon: 'trash' }}
/>

<Story name="Left" args={{ left: true }} />

<Story name="Left with Icon" args={{ left: true, icon: 'trash' }} />

<Story name="Right" args={{ right: true }} />

<Story name="Right with Icon" args={{ right: true, icon: 'trash' }} />

<Story
  name="Focus Origin Interactions"
  args={{ show: false, text: 'Focus origin tooltip', top: true }}
  play={async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const beforeTrigger = canvas.getByRole('button', {
      name: 'Before tooltip',
    });
    const trigger = canvas.getByRole('button', { name: 'Tooltip trigger' });

    await step('Pointer focus does not pin the tooltip open', async () => {
      expect(canvas.queryByRole('tooltip')).not.toBeInTheDocument();

      await userEvent.hover(trigger);
      await waitFor(() => expect(canvas.getByRole('tooltip')).toBeVisible());

      await userEvent.click(trigger);
      expect(trigger).toHaveFocus();
      await userEvent.unhover(trigger);

      await waitFor(() =>
        expect(canvas.queryByRole('tooltip')).not.toBeInTheDocument(),
      );
      expect(trigger).toHaveFocus();
    });

    await step(
      'Keyboard focus opens and Escape dismisses the tooltip',
      async () => {
        beforeTrigger.focus();
        expect(beforeTrigger).toHaveFocus();

        await userEvent.tab();
        expect(trigger).toHaveFocus();
        await waitFor(() => expect(canvas.getByRole('tooltip')).toBeVisible());

        await userEvent.keyboard('{Escape}');
        await waitFor(() =>
          expect(canvas.queryByRole('tooltip')).not.toBeInTheDocument(),
        );
        expect(trigger).toHaveFocus();
      },
    );
  }}
>
  {#snippet template(args)}
    <div class="flex items-center gap-3">
      <Button variant="secondary">Before tooltip</Button>
      <Tooltip {...args}>
        <Button>Tooltip trigger</Button>
      </Tooltip>
    </div>
  {/snippet}
</Story>

<Story name="With Content instead of text" asChild>
  <Tooltip bottomRight show>
    {#snippet content()}
      <div>
        <div>whadup</div>
        <div>whadup</div>
        <div>whadup</div>
      </div>
    {/snippet}
    <Button>Tooltip</Button>
  </Tooltip>
</Story>

<Story name="Portal (avoids overflow clipping)" asChild>
  <div class="overflow-hidden rounded border border-slate-600 p-4">
    <Tooltip top usePortal text="This renders outside the overflow container">
      <Button>Hover me (portal)</Button>
    </Tooltip>
  </div>
</Story>

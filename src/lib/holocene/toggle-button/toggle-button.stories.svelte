<script lang="ts" module>
  import { get, writable } from 'svelte/store';

  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { action } from 'storybook/actions';
  import { expect, userEvent, within } from 'storybook/test';
  import type { ComponentProps } from 'svelte';

  import ToggleButton from './toggle-button.svelte';
  import ToggleButtons from './toggle-buttons.svelte';

  const { Story } = defineMeta({
    title: 'Toggle Button',
    component: ToggleButton,
    argTypes: {
      group: { table: { disable: true } },
      base: { table: { disable: true } },
      href: { table: { disable: true } },
      active: { table: { disable: true } },
    },
  });
</script>

<script lang="ts">
  const selected = writable(0);
  const select = (index: number) => {
    selected.set(index);
    action('select')(index);
  };
</script>

{#snippet template(args: ComponentProps<typeof ToggleButton>)}
  <ToggleButtons data-testid="toggle-button-group">
    {#each ['John', 'Paul', 'George', 'Ringo'] as name, index (name)}
      <ToggleButton
        {...args}
        data-testid={`toggle-button-${index}`}
        active={$selected === index}
        onclick={() => select(index)}
      >
        {name}
      </ToggleButton>
    {/each}
  </ToggleButtons>
{/snippet}

<Story
  name="Default"
  play={async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    selected.set(0);
    const first = await canvas.findByTestId('toggle-button-0');
    const second = await canvas.findByTestId('toggle-button-1');
    const third = await canvas.findByTestId('toggle-button-2');
    const fourth = await canvas.findByTestId('toggle-button-3');
    const group = await canvas.findByTestId('toggle-button-group');
    await step(
      'Separate grouped controls while keeping complete borders',
      () => {
        expect(group).toHaveClass('gap-0.5');
        expect(first).toHaveClass('border', 'rounded-control');
        expect(first.className).not.toContain('border-r-0');
      },
    );
    await step('Validate that the selected toggle is active', async () => {
      const selectedToggle = await canvas.findByTestId(
        `toggle-button-${get(selected)}`,
      );
      expect(selectedToggle).toHaveClass('bg-interactive-secondary-active');
    });
    await step('Validate that the other toggles are not active', async () => {
      expect(second).not.toHaveClass('bg-interactive-secondary-active');
      expect(third).not.toHaveClass('bg-interactive-secondary-active');
      expect(fourth).not.toHaveClass('bg-interactive-secondary-active');
    });
    await step('Click the second toggle', async () => {
      await userEvent.click(second);
      expect(first).not.toHaveClass('bg-interactive-secondary-active');
      expect(second).toHaveClass('bg-interactive-secondary-active');
    });
  }}
  {template}
/>

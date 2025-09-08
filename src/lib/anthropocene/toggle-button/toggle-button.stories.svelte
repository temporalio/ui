<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';
  import { expect, userEvent, within } from '@storybook/test';

  import { iconNames } from '$lib/anthropocene/icon';

  import ToggleButton from './toggle-button.svelte';
  import ToggleButtons from './toggle-buttons.svelte';

  export const meta = {
    title: 'Toggle Button',
    component: ToggleButton,
    subcomponents: { ToggleButtons },
    argTypes: {
      icon: { name: 'Icon', control: 'select', options: iconNames },
      group: { table: { disable: true } },
      base: { table: { disable: true } },
      href: { table: { disable: true } },
      active: { table: { disable: true } },
    },
  } satisfies Meta<ToggleButton>;
</script>

<script lang="ts">
  import { get, writable } from 'svelte/store';

  import { action } from '@storybook/addon-actions';
  import { Story, Template } from '@storybook/addon-svelte-csf';

  const selected = writable(0);
  const select = (index: number) => {
    selected.set(index);
    action('select')(index);
  };

  const play: Story['play'] = async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    selected.set(0);

    const first = await canvas.findByTestId('toggle-button-0');
    const second = await canvas.findByTestId('toggle-button-1');
    const third = await canvas.findByTestId('toggle-button-2');
    const fourth = await canvas.findByTestId('toggle-button-3');

    await step('Validate that the selected toggle is active', async () => {
      const selectedToggle = await canvas.findByTestId(
        `toggle-button-${get(selected)}`,
      );

      expect(selectedToggle).toHaveClass('active');
    });

    await step('Validate that the other toggles are not active', async () => {
      expect(second).not.toHaveClass('active');
      expect(third).not.toHaveClass('active');
      expect(fourth).not.toHaveClass('active');
    });

    await step('Click the second toggle', async () => {
      await userEvent.click(second);
      expect(first).not.toHaveClass('active');
      expect(second).toHaveClass('active');
    });
  };
</script>

<Template let:args>
  <ToggleButtons>
    {#each ['John', 'Paul', 'George', 'Ringo'] as name, index}
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
</Template>

<Story name="Default" {play} />

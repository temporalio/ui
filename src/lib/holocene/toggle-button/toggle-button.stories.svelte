<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
  } from '@storybook/addon-svelte-csf';
  import { expect, userEvent, within } from '@storybook/test';
  import type { Component } from 'svelte';

  import { iconNames } from '$lib/holocene/icon';

  import ToggleButton, { type BaseProps } from './toggle-button.svelte';
  import ToggleButtons from './toggle-buttons.svelte';

  const { Story } = defineMeta<Component<BaseProps>>({
    title: 'Toggle Button',
    component: ToggleButton,
    argTypes: {
      icon: { name: 'Icon', control: 'select', options: iconNames },
      group: { table: { disable: true } },
      base: { table: { disable: true } },
      href: { table: { disable: true } },
      active: { table: { disable: true } },
    },
  });
</script>

<script lang="ts">
  import { get, writable } from 'svelte/store';

  import { action } from '@storybook/addon-actions';

  setTemplate(template);

  const selected = writable(0);
  const select = (index: number) => {
    selected.set(index);
    action('select')(index);
  };

  const play = async ({ canvasElement, step }) => {
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

{#snippet template(args: Args<typeof Story>)}
  <ToggleButtons>
    {#each ['John', 'Paul', 'George', 'Ringo'] as name, index}
      <ToggleButton
        {...args}
        data-testid={`toggle-button-${index}`}
        active={$selected === index}
        onclick={() => select(index)}
        href={undefined}
      >
        {name}
      </ToggleButton>
    {/each}
  </ToggleButtons>
{/snippet}

<Story name="Default" {play} />

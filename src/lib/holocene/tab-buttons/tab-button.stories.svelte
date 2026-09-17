<script lang="ts" module>
  import { get, writable } from 'svelte/store';

  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { action } from 'storybook/actions';
  import { expect, userEvent, within } from 'storybook/test';
  import type { ComponentProps } from 'svelte';

  import * as ioIcons from '$lib/io/icon';

  import TabButton from './tab-button.svelte';
  import TabButtons from './tab-buttons.svelte';

  const iconOptions: Record<string, unknown> = { ...ioIcons };

  const { Story } = defineMeta({
    title: 'Tab Button',
    component: TabButton,
    subcomponents: { TabButtons },
    argTypes: {
      Icon: {
        name: 'Icon',
        control: 'select',
        options: Object.keys(iconOptions),
        mapping: iconOptions,
      },
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

{#snippet template(args: ComponentProps<typeof TabButton>)}
  <TabButtons>
    {#each ['John', 'Paul', 'George', 'Ringo'] as name, index (name)}
      <TabButton
        {...args}
        data-testid={`toggle-button-${index}`}
        active={$selected === index}
        onclick={() => select(index)}
      >
        {name}
      </TabButton>
    {/each}
  </TabButtons>
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
  }}
  {template}
/>

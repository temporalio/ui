<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import BadgeCount from '$lib/io/badge-count/badge-count.svelte';
  import IconAdd from '$lib/io/icon/icons/add.svelte';
  import IconChevronDown from '$lib/io/icon/icons/chevron-down.svelte';
  import IconTemporal from '$lib/io/icon/icons/temporal.svelte';

  import Button, {
    type ButtonColorScheme,
    type ButtonSize,
  } from './button.svelte';

  const colorSchemes: ButtonColorScheme[] = [
    'primary',
    'secondary',
    'tertiary',
    'ghost',
    'danger',
  ];
  const sizes: ButtonSize[] = ['md', 'sm', 'xs'];

  const { Story } = defineMeta({
    title: 'IO/Design System/Button',
    component: Button,
    args: { colorScheme: 'primary', size: 'md', disabled: false },
    argTypes: {
      colorScheme: { control: 'select', options: colorSchemes },
      size: { control: 'select', options: sizes },
      disabled: { control: 'boolean' },
      variant: { table: { disable: true } },
      children: { control: false },
      Icon: { control: false },
      LeadingIcon: { control: false },
      TrailingIcon: { control: false },
      trailingElement: { control: false },
      class: { table: { disable: true } },
    },
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof Button>)}
  <div class="bg-background-primary p-6">
    <Button
      colorScheme={args.colorScheme}
      size={args.size}
      disabled={args.disabled}>Button</Button
    >
  </div>
{/snippet}

<Story name="Playground" />

<Story name="Variants and sizes">
  {#snippet template()}
    <div class="flex flex-col gap-6 bg-background-primary p-6">
      {#each sizes as size (size)}
        {#each colorSchemes as colorScheme (colorScheme)}
          <div class="flex items-center gap-4">
            <span class="w-28 text-xs text-primary">{colorScheme} / {size}</span
            >
            <Button {size} {colorScheme}>Button</Button>
            <Button
              {size}
              {colorScheme}
              LeadingIcon={IconAdd}
              TrailingIcon={IconChevronDown}>Button</Button
            >
            <Button {size} {colorScheme} disabled>Button</Button>
            <Button
              {size}
              {colorScheme}
              variant="icon"
              Icon={IconTemporal}
              aria-label="Temporal"
            />
            <Button
              {size}
              {colorScheme}
              variant="icon"
              Icon={IconTemporal}
              aria-label="Temporal"
              disabled
            />
          </div>
        {/each}
      {/each}
    </div>
  {/snippet}
</Story>

<Story name="Trailing element">
  {#snippet template()}
    <div class="flex items-center gap-4 bg-background-primary p-6">
      {#each colorSchemes as colorScheme (colorScheme)}
        <Button {colorScheme}>
          Button
          {#snippet trailingElement()}
            <BadgeCount
              value={0}
              class={colorScheme === 'primary'
                ? 'min-h-4 border-0 bg-surface-overlay-neutral py-0.5 font-mono text-xs text-white [&>span]:px-1'
                : colorScheme === 'danger'
                  ? 'min-h-4 border-0 bg-surface-overlay-danger py-0.5 font-mono text-xs text-red-7 [&>span]:px-1'
                  : 'min-h-4 border-0 bg-interactive-tertiary-hover py-0.5 font-mono text-xs text-inherit [&>span]:px-1'}
            />
          {/snippet}
        </Button>
      {/each}
    </div>
  {/snippet}
</Story>

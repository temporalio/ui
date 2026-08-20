<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import Button from '../button.svelte';

  import Portal from './portal.svelte';

  const { Story } = defineMeta({
    title: 'Portal',
    component: Portal,
    args: {
      position: 'bottom',
      hideWhenAnchorHidden: true,
      flipOnCollision: true,
      open: true,
      offset: { x: 0, y: 0 },
    },
    argTypes: {
      position: {
        name: 'Position',
        control: 'select',
        options: [
          'top',
          'bottom',
          'left',
          'right',
          'top-left',
          'top-right',
          'bottom-left',
          'bottom-right',
        ],
      },
      open: {
        name: 'Open',
        control: 'boolean',
      },
      hideWhenAnchorHidden: {
        name: 'Hide When Anchor Hidden',
        control: 'boolean',
      },
      flipOnCollision: {
        name: 'Flip On Collision',
        control: 'boolean',
      },
      offset: {
        name: 'Offset',
        control: 'object',
        description: 'Offset in pixels { x: number, y: number }',
      },
      anchor: { table: { disable: true } },
      target: { table: { disable: true } },
      scrollContainer: { table: { disable: true } },
      class: { table: { disable: true } },
      children: { table: { disable: true } },
    },
  });
</script>

{#snippet template(args: ComponentProps<typeof Portal>)}
  {@const { children: _children, ...rest } = args}
  <div class="flex min-h-screen items-center justify-center p-8">
    <Button id="portal-button" onclick={() => (args.open = !args.open)}>
      Toggle Portal
    </Button>

    <Portal {...rest} anchor="portal-button" open={args.open}>
      <div
        class="border border-io-border-tertiary bg-io-surface-primary p-4"
        style="max-width: 200px;"
      >
        <p class="text-sm">Portal content goes here.</p>
      </div>
    </Portal>
  </div>
{/snippet}

<Story name="Default" {template} />

<Story
  name="Flip on Collision (Top)"
  args={{ offset: { y: -4 }, position: 'top' }}
>
  {#snippet template(args)}
    <div class="relative min-h-screen p-4">
      <Button
        id="top-button"
        onclick={() => (args.open = !args.open)}
        class="absolute left-1/2 top-4"
      >
        Top
      </Button>
      <Portal
        anchor="top-button"
        open={args.open}
        position={args.position}
        flipOnCollision={args.flipOnCollision}
        offset={args.offset}
      >
        <div
          class="border border-io-border-tertiary bg-io-surface-primary p-4 shadow-lg"
        >
          <p class="text-xs">Positioned top but flipOnCollision is enabled.</p>
        </div>
      </Portal>
    </div>
  {/snippet}
</Story>

<Story
  name="Flip on Collision (Bottom)"
  args={{ offset: { y: 4 }, position: 'bottom' }}
>
  {#snippet template(args)}
    <div class="relative min-h-screen p-4">
      <Button
        id="bottom-button"
        onclick={() => (args.open = !args.open)}
        class="absolute bottom-4 left-1/2"
      >
        Bottom
      </Button>
      <Portal
        anchor="bottom-button"
        open={args.open}
        position={args.position}
        flipOnCollision={args.flipOnCollision}
        offset={args.offset}
      >
        <div
          class="border border-io-border-tertiary bg-io-surface-primary p-4 shadow-lg"
        >
          <p class="text-xs">
            Positioned bottom but flipOnCollision is enabled.
          </p>
        </div>
      </Portal>
    </div>
  {/snippet}
</Story>

<Story
  name="Flip on Collision (Left)"
  args={{ offset: { x: -4 }, position: 'left' }}
>
  {#snippet template(args)}
    <div class="relative min-h-screen p-4">
      <Button
        id="left-button"
        onclick={() => (args.open = !args.open)}
        class="absolute left-4 top-1/2"
      >
        Left
      </Button>
      <Portal
        anchor="left-button"
        open={args.open}
        position={args.position}
        flipOnCollision={args.flipOnCollision}
        offset={args.offset}
      >
        <div
          class="border border-io-border-tertiary bg-io-surface-primary p-4 shadow-lg"
        >
          <p class="text-xs">Positioned left but flipOnCollision is enabled.</p>
        </div>
      </Portal>
    </div>
  {/snippet}
</Story>

<Story
  name="Flip on Collision (Right)"
  args={{ offset: { x: 4 }, position: 'right' }}
>
  {#snippet template(args)}
    <div class="relative min-h-screen p-4">
      <Button
        id="right-button"
        onclick={() => (args.open = !args.open)}
        class="absolute right-4 top-1/2"
      >
        Right
      </Button>
      <Portal
        anchor="right-button"
        open={args.open}
        position={args.position}
        flipOnCollision={args.flipOnCollision}
        offset={args.offset}
      >
        <div
          class="border border-io-border-tertiary bg-io-surface-primary p-4 shadow-lg"
        >
          <p class="text-xs">
            Positioned right but flipOnCollision is enabled.
          </p>
        </div>
      </Portal>
    </div>
  {/snippet}
</Story>

<Story name="Hide When Invisible" args={{ offset: { y: 4 } }}>
  {#snippet template(args)}
    <div
      id="combined-container"
      class="h-96 w-1/2 overflow-auto rounded border border-io-border-tertiary bg-io-surface-secondary p-4"
    >
      <div class="h-[800px] w-[1200px]">
        <p class="mb-2 text-xs text-io-content-secondary">
          Scroll in any direction. The portal will hide when out of view and
          flip when near edges.
        </p>
        <div class="ml-[200px] mt-[300px]">
          <Button id="combined-button" onclick={() => (args.open = !args.open)}>
            Toggle Portal
          </Button>
          <Portal
            anchor="combined-button"
            open={args.open}
            position={args.position}
            scrollContainer="combined-container"
            hideWhenAnchorHidden={args.hideWhenAnchorHidden}
            flipOnCollision={args.flipOnCollision}
            offset={args.offset}
          >
            <div
              class="max-w-60 border border-io-border-tertiary bg-io-surface-primary p-4 shadow-lg"
            >
              <p class="text-sm">
                ✅ Custom scroll container<br />
                ✅ Hide when invisible<br />
                ✅ Flip on collision<br />
              </p>
            </div>
          </Portal>
        </div>
      </div>
    </div>
  {/snippet}
</Story>

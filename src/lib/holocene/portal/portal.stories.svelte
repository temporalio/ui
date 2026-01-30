<script lang="ts" module>
  import type { Meta } from '@storybook/svelte';

  import Portal from './portal.svelte';

  export const meta = {
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
  } satisfies Meta<typeof Portal>;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';

  import Button from '../button.svelte';
</script>

<Template let:args>
  <div class="flex min-h-screen items-center justify-center p-8">
    <Button id="portal-button" on:click={() => (args.open = !args.open)}>
      Toggle Portal
    </Button>

    <Portal anchor="portal-button" open={args.open} {...args}>
      <div
        class="border border-subtle bg-primary p-4"
        style="max-width: 200px;"
      >
        <p class="text-sm">Portal content goes here.</p>
      </div>
    </Portal>
  </div>
</Template>

<Story name="Default" />

<Story
  name="Flip on Collision (Top)"
  let:args
  args={{ offset: { y: -4 }, position: 'top' }}
>
  <div class="relative min-h-screen p-4">
    <Button
      id="top-button"
      on:click={() => (args.open = !args.open)}
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
      <div class="border border-subtle bg-primary p-4 shadow-lg">
        <p class="text-xs">Positioned top but flipOnCollision is enabled.</p>
      </div>
    </Portal>
  </div>
</Story>

<Story
  name="Flip on Collision (Bottom)"
  let:args
  args={{ offset: { y: 4 }, position: 'bottom' }}
>
  <div class="relative min-h-screen p-4">
    <Button
      id="bottom-button"
      on:click={() => (args.open = !args.open)}
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
      <div class="border border-subtle bg-primary p-4 shadow-lg">
        <p class="text-xs">Positioned bottom but flipOnCollision is enabled.</p>
      </div>
    </Portal>
  </div>
</Story>

<Story
  name="Flip on Collision (Left)"
  let:args
  args={{ offset: { x: -4 }, position: 'left' }}
>
  <div class="relative min-h-screen p-4">
    <Button
      id="left-button"
      on:click={() => (args.open = !args.open)}
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
      <div class="border border-subtle bg-primary p-4 shadow-lg">
        <p class="text-xs">Positioned left but flipOnCollision is enabled.</p>
      </div>
    </Portal>
  </div>
</Story>

<Story
  name="Flip on Collision (Right)"
  let:args
  args={{ offset: { x: 4 }, position: 'right' }}
>
  <div class="relative min-h-screen p-4">
    <Button
      id="right-button"
      on:click={() => (args.open = !args.open)}
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
      <div class="border border-subtle bg-primary p-4 shadow-lg">
        <p class="text-xs">Positioned right but flipOnCollision is enabled.</p>
      </div>
    </Portal>
  </div>
</Story>

<Story name="Hide When Invisible" let:args args={{ offset: { y: 4 } }}>
  <div
    id="combined-container"
    class="h-96 w-1/2 overflow-auto rounded border border-subtle bg-secondary p-4"
  >
    <div class="h-[800px] w-[1200px]">
      <p class="mb-2 text-xs text-secondary">
        Scroll in any direction. The portal will hide when out of view and flip
        when near edges.
      </p>
      <div class="ml-[200px] mt-[300px]">
        <Button id="combined-button" on:click={() => (args.open = !args.open)}>
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
          <div class="max-w-60 border border-subtle bg-primary p-4 shadow-lg">
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
</Story>

<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import RoundnessGroup from './roundness-group.svelte';

  const { Story } = defineMeta({
    title: 'IO/Components/Roundness Group',
    component: RoundnessGroup,
    args: {
      roundness: 'full',
      roundnessTarget: 'children',
      innerBorderHandling: 'collapse',
    },
    argTypes: {
      roundness: {
        control: 'select',
        options: ['none', 'sm', 'base', 'lg', 'full'],
      },
      roundnessTarget: {
        control: 'select',
        options: ['children', 'wrapper'],
      },
      innerBorderHandling: {
        control: 'select',
        options: ['none', 'erase', 'collapse'],
      },
      children: { control: false },
    },
    parameters: { layout: 'padded' },
  });
</script>

{#snippet template(args: ComponentProps<typeof RoundnessGroup>)}
  <RoundnessGroup {...args} class="inline-flex">
    <span class="border border-primary bg-surface-primary px-3 py-1">First</span
    >
    <span class="border border-primary bg-surface-primary px-3 py-1"
      >Second</span
    >
    <span class="border border-primary bg-surface-primary px-3 py-1">Third</span
    >
  </RoundnessGroup>
{/snippet}

<Story tags={['!dev']} name="Playground" {template} />
<Story
  name="Separate borders"
  args={{ innerBorderHandling: 'none' }}
  {template}
/>
<Story name="Square corners" args={{ roundness: 'none' }} {template} />

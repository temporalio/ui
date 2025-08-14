<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import Skeleton from './index.svelte';

  export const meta = {
    title: 'Skeleton Loader',
    component: Skeleton,
    args: { class: 'h-4' },
    argTypes: {
      class: {
        control: 'text',
        description: 'Tailwind compliant "height" class, i.e. h-10',
      },
    },
  } satisfies Meta<Skeleton>;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
  <Skeleton {...args} />
</Template>

<Story name="Default" />

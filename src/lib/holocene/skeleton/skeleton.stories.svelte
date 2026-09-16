<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import Skeleton from './index.svelte';

  const { Story } = defineMeta({
    title: 'Skeleton Loader',
    component: Skeleton,
    args: { class: 'h-4' },
    argTypes: {
      class: {
        control: 'text',
        description: 'Tailwind compliant "height" class, i.e. h-10',
      },
    },
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof Skeleton>)}
  <div class="bg-surface-primary p-4">
    <Skeleton {...args} />
  </div>
{/snippet}

<Story name="Default" />

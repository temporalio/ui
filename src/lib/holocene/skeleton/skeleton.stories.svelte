<svelte:options runes />

<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

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
  });
</script>

<Story name="Default" />

<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
  } from '@storybook/addon-svelte-csf';

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

<script lang="ts">
  setTemplate(template);
</script>

{#snippet template(args: Args<typeof Story>)}
  <Skeleton {...args} />
{/snippet}

<Story name="Default" />

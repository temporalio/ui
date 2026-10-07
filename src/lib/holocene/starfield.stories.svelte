<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import Starfield from './starfield.svelte';

  const { Story } = defineMeta({
    title: 'Starfield',
    component: Starfield,
    args: {
      class: 'h-96 w-full text-secondary',
    },
  });
</script>

<Story name="Default" />

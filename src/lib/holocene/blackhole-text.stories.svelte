<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import BlackholeText from './blackhole-text.svelte';

  const { Story } = defineMeta({
    title: 'Blackhole Text',
    component: BlackholeText,
    args: {
      text: '404',
      class: 'mx-auto h-40 w-full max-w-md text-brand',
    },
    argTypes: {
      text: { control: 'text' },
    },
  });
</script>

<Story name="Default" />

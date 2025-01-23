<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
  } from '@storybook/addon-svelte-csf';

  import Card from './card.svelte';

  const { Story } = defineMeta({
    title: 'Card',
    component: Card,
  });
</script>

<script lang="ts">
  setTemplate(template);
</script>

{#snippet template(args: Args<typeof Story>)}
  <Card {...args}>
    <p>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut cupiditate
      exercitationem quia quibusdam excepturi rem saepe dolore quas, odit vero
      sed rerum necessitatibus minima nobis, ullam minus inventore voluptates
      itaque?
    </p>
  </Card>
{/snippet}

<Story name="Default" />

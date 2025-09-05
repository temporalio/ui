<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import Card from './card.svelte';

  export const meta = {
    title: 'Card',
    component: Card,
  } satisfies Meta<Card>;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
  <Card {...args}>
    <p>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut cupiditate
      exercitationem quia quibusdam excepturi rem saepe dolore quas, odit vero
      sed rerum necessitatibus minima nobis, ullam minus inventore voluptates
      itaque?
    </p>
  </Card>
</Template>

<Story name="Default" />

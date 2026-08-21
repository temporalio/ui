<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import Card from './card.svelte';

  const { Story } = defineMeta({
    title: 'Card',
    component: Card,
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof Card>)}
  <div class="bg-io-surface-primary p-4 text-io-content-primary">
    <Card {...args}>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut cupiditate
        exercitationem quia quibusdam excepturi rem saepe dolore quas, odit vero
        sed rerum necessitatibus minima nobis, ullam minus inventore voluptates
        itaque?
      </p>
    </Card>
  </div>
{/snippet}

<Story name="Default" />

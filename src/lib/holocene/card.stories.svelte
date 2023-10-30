<script lang="ts">
  import { Meta, Story } from '@storybook/addon-svelte-csf';

  import Card from './card.svelte';
</script>

<Meta title="Card" component={Card} />

<Story name="card">
  <Card>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
  </Card>
</Story>

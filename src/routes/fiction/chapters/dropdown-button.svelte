<script lang="ts">
  import DropdownButton from '$lib/holocene/dropdown-button/index.svelte';
  import Item from '$lib/holocene/dropdown-button/radio-menu-item.svelte';
  import Chapter from '../_chapter.svelte';

  let options = {
    pepperoni: 'Pepperoni',
    green_peppers: 'Green Peppers',
    black_olives: 'Black Olives',
  };

  let favoritePizzaTopping: string;

  const updateValue = (event: CustomEvent<{ value: string }>) => {
    favoritePizzaTopping = event.detail.value;
  };
</script>

<Chapter description="A simple dropdown menu">
  <DropdownButton
    label={options[favoritePizzaTopping] ?? 'Favorite Pizza Topping'}
    icon="clock"
  >
    {#each Object.entries(options) as [value, label]}
      <Item
        on:click={updateValue}
        name="pizza-toppings"
        {value}
        checked={value === favoritePizzaTopping}>{label}</Item
      >
    {/each}
  </DropdownButton>
</Chapter>

<script lang="ts">
  import { writable } from 'svelte/store';
  import Chapter from '../_chapter.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import type { Option as OptionType } from '$lib/holocene/select/option.svelte';

  const foodOptions = [
    {
      label: 'Pizza 🍕',
      value: 'pizza',
      description: 'New York style, obviously.',
    },
    {
      label: 'Hamburger 🍔',
      value: 'hamburger',
      description: 'Surprisingly, ham is not an ingredient.',
    },
    {
      label: 'Hot Dog 🌭',
      value: 'hot dog',
      description: 'Or as the kids call it, a glizzy.',
    },
  ];

  const drinkOptions = [
    {
      label: 'Coffee ☕️',
      value: 'coffee',
    },
    {
      label: 'Tea 🍵',
      value: 'tea',
    },
    {
      label: 'Milk 🥛',
      value: 'milk',
    },
  ];

  const animalOptions = [
    {
      label: 'Elephant 🐘',
      value: 'elephant',
    },
    {
      label: 'Tiger 🐅',
      value: 'tiger',
    },
    {
      label: 'Zebra 🦓',
      value: 'zebra',
    },
  ];

  const favoriteDrink = writable<OptionType<string> | undefined>(undefined);
  const favoriteFood = writable<OptionType<string>>(foodOptions[0]);
  const favoriteAnimal = writable<OptionType<string>>(animalOptions[2]);
  const favoriteNumber = writable<OptionType<number>>();

  function handleAnimalClick(
    event: CustomEvent<{ option: OptionType<string> }>,
  ) {
    favoriteAnimal.set(event.detail.option);
  }
</script>

<Chapter description="A select dropdown">
  <Select
    label="Favorite Drink"
    id="favorite-drink"
    options={drinkOptions}
    value={$favoriteDrink}
    on:change={(event) => favoriteDrink.set(event.detail.option)}
  />
</Chapter>

<Chapter description="A dark select dropdown with option descriptions">
  <Select
    label="Favorite Food"
    id="favorite-food"
    dark
    options={foodOptions}
    value={$favoriteFood}
    on:change={(event) => favoriteFood.set(event.detail.option)}
  />
</Chapter>

<Chapter description="A select dropdown with composed options">
  <Select label="Favorite Animal" id="favorite-animal" value={$favoriteAnimal}>
    {#each animalOptions as option}
      <Option
        {...option}
        on:click={handleAnimalClick}
        selected={option.value == $favoriteAnimal.value}
      />
    {/each}
  </Select>
</Chapter>

<Chapter description="A long select dropdown with numbers">
  <Select
    label="Favorite Number"
    id="favorite-number"
    value={$favoriteNumber}
    on:change={(event) => favoriteNumber.set(event.detail.option)}
    options={new Array(20)
      .fill(undefined)
      .map((_, i) => ({ label: `Number ${i}`, value: i }))}
  />
</Chapter>

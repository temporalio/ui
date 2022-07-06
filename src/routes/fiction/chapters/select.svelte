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

  const favoriteDrink = writable<OptionType>();
  const favoriteFood = writable<OptionType>(foodOptions[0]);
  const favoriteAnimal = writable<OptionType>(animalOptions[2]);
  const favoriteNumber = writable<OptionType>();
  const favoriteLetter = writable<string>();
</script>

<Chapter description="A select dropdown">
  <Select
    label="Favorite Drink"
    id="favorite-drink"
    options={drinkOptions}
    value={$favoriteDrink}
    on:select={(event) => favoriteDrink.set(event.detail.value)}
  />
</Chapter>

<Chapter
  description="A dark select dropdown with option descriptions and a default value"
>
  <Select
    label="Favorite Food"
    id="favorite-food"
    dark
    options={foodOptions}
    value={$favoriteFood}
    on:select={(event) => favoriteFood.set(event.detail.value)}
  />
</Chapter>

<Chapter description="A select dropdown with composed options">
  <Select label="Favorite Animal" id="favorite-animal" value={$favoriteAnimal}>
    {#each animalOptions as option}
      <Option
        value={option}
        on:select={(event) => favoriteAnimal.set(event.detail.value)}
        selected={option.value == $favoriteAnimal.value}
        let:handleOptionClick
      />
    {/each}
  </Select>
</Chapter>

<Chapter description="A long select dropdown with numbers">
  <Select
    label="Favorite Number"
    id="favorite-number"
    value={$favoriteNumber}
    on:select={(event) => favoriteNumber.set(event.detail.value)}
    options={new Array(20)
      .fill(undefined)
      .map((_, i) => ({ label: `Number ${i}`, value: i }))}
  />
</Chapter>

<Chapter description="A select dropdown with string values only">
  <Select label="Favorite Letter" id="favorite letter" value={$favoriteLetter}>
    {#each 'abcdefghijklmnop'.split('') as option}
      <Option
        on:select={(event) => favoriteLetter.set(event.detail.value)}
        value={option}
        selected={option === $favoriteLetter}
      />
    {/each}
  </Select>
</Chapter>

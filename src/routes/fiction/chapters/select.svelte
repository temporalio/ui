<script lang="ts">
  import Chapter from '../_chapter.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import OptionGroup from '$lib/holocene/select/option-group.svelte';

  let favoriteDrink = '';
  let favoriteFood = '';
  let favoriteAnimal = '';
  let favoriteNumber: number;
</script>

<Chapter description="A select dropdown">
  <Select
    label="Favorite Drink"
    placeholder="Favorite Drink"
    id="favorite-drink"
    bind:value={favoriteDrink}
  >
    <Option value="coffee">Coffee</Option>
    <Option value="tea">Tea</Option>
    <Option value="milk">Milk</Option>
  </Select>
</Chapter>

<Chapter
  description="A dark select dropdown with option descriptions and a default value"
>
  <Select
    label="Favorite Food"
    id="favorite-food"
    placeholder="Favorite Food"
    dark
    bind:value={favoriteFood}
  >
    <Option value="pizza" description="New York style">Pizza</Option>
    <Option value="hamburgers" description="With or without cheese"
      >Hamburgers</Option
    >
    <Option value="hot_dogs">Hot Dogs</Option>
  </Select>
</Chapter>

<Chapter description="A long select dropdown with numbers">
  <Select label="Favorite Number" id="favorite-number" value={favoriteNumber}>
    {#each new Array(20).fill(undefined).map((_, i) => i) as value}
      <Option {value}>{value}</Option>
    {/each}
  </Select>
</Chapter>

<Chapter description="A disabled select dropdown">
  <Select
    id="favorite-color"
    placeholder="Favorite Color"
    value={null}
    disabled
  />
</Chapter>

<Chapter description="A select dropdown with wider options">
  <Select
    class="w-80"
    value={null}
    id="wide-options"
    placeholder="Select an option..."
  >
    <Option
      description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi nisi
    reprehenderit alias rerum minus, nulla ratione ipsum expedita. Praesentium
    doloribus animi, dolorem nesciunt repellendus maxime deleniti vitae
    corrupti deserunt aperiam?"
      >Lorem ipsum dolor sit amet consectetur adipisicing elit 1.</Option
    >
    <Option
      description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi nisi
    reprehenderit alias rerum minus, nulla ratione ipsum expedita. Praesentium
    doloribus animi, dolorem nesciunt repellendus maxime deleniti vitae
    corrupti deserunt aperiam?"
      >Lorem ipsum dolor sit amet consectetur adipisicing elit 2.</Option
    >
    <Option
      description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi nisi
    reprehenderit alias rerum minus, nulla ratione ipsum expedita. Praesentium
    doloribus animi, dolorem nesciunt repellendus maxime deleniti vitae
    corrupti deserunt aperiam?"
      >Lorem ipsum dolor sit amet consectetur adipisicing elit 3.</Option
    >
  </Select>
</Chapter>

<Chapter description="A select dropdown with Option Groups">
  <Select id="grouped-select" value={favoriteAnimal}>
    <OptionGroup label="Mammals">
      <Option>Horse</Option>
      <Option>Dog</Option>
      <Option>Cat</Option>
    </OptionGroup>
    <OptionGroup label="Reptiles">
      <Option>Snake</Option>
      <Option>Lizard</Option>
    </OptionGroup>
    <OptionGroup label="Amphibians">
      <Option>Frog</Option>
      <Option>Salamander</Option>
    </OptionGroup>
  </Select>
</Chapter>

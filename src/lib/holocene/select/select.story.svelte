<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  import OptionGroup from './option-group.svelte';

  import Option from './option.svelte';
  import Select from './select.svelte';
  import SimpleOption from './simple-option.svelte';
  import SimpleSelect from './simple-select.svelte';

  export let Hst: HST;

  let value = '';
  let disabled = false;
</script>

<Hst.Story>
  <Hst.Variant title="A Default Fancy Select">
    <Select
      id="select-1"
      label="Favorite Food"
      placeholder="Select an Option"
      bind:value
      bind:disabled
    >
      <Option value="pizza">Pizza</Option>
      <Option value="hamburger">Hamburgers</Option>
      <Option value="hot dog">Hot Dogs</Option>
    </Select>
  </Hst.Variant>

  <Hst.Variant title="With Option Descriptions">
    <Select
      value={null}
      id="select-2"
      placeholder="Select an option..."
      {disabled}
    >
      <Option
        description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi nisi
        reprehenderit alias rerum minus, nulla ratione ipsum expedita. Praesentium
        doloribus animi, dolorem nesciunt repellendus maxime deleniti vitae
        corrupti deserunt aperiam?"
        value={1}
        >Lorem ipsum dolor sit amet consectetur adipisicing elit 1.</Option
      >
      <Option
        description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi nisi
        reprehenderit alias rerum minus, nulla ratione ipsum expedita. Praesentium
        doloribus animi, dolorem nesciunt repellendus maxime deleniti vitae
        corrupti deserunt aperiam?"
        value={2}
        >Lorem ipsum dolor sit amet consectetur adipisicing elit 2.</Option
      >
      <Option
        description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi nisi
        reprehenderit alias rerum minus, nulla ratione ipsum expedita. Praesentium
        doloribus animi, dolorem nesciunt repellendus maxime deleniti vitae
        corrupti deserunt aperiam?"
        value={3}
        >Lorem ipsum dolor sit amet consectetur adipisicing elit 3.</Option
      >
    </Select>
  </Hst.Variant>

  <Hst.Variant title="With Grouped Options">
    <Select id="select-3" placeholder="Select an Option" {value} {disabled}>
      <OptionGroup label="Mammals">
        <Option value="horse">Horse</Option>
        <Option value="dog">Dog</Option>
        <Option value="cat">Cat</Option>
      </OptionGroup>
      <OptionGroup label="Reptiles">
        <Option value="snake">Snake</Option>
        <Option value="lizard">Lizard</Option>
      </OptionGroup>
      <OptionGroup label="Amphibians">
        <Option value="frog">Frog</Option>
        <Option value="salamander">Salamander</Option>
      </OptionGroup>
    </Select>
  </Hst.Variant>

  <Hst.Variant title="A Simple Select">
    <SimpleSelect id="select-4" bind:value>
      <SimpleOption>Option 1</SimpleOption>
      <SimpleOption>Option 2</SimpleOption>
      <SimpleOption>Option 3</SimpleOption>
    </SimpleSelect>
  </Hst.Variant>

  <Hst.Variant title="A Select with a lot of Options">
    <Select placeholder="Select an option" {value} id="select-5">
      {#each new Array(100).fill(0).map((_, idx) => idx) as idx}
        <Option value={idx}>Option {idx}</Option>
      {/each}
    </Select>
  </Hst.Variant>

  <svelte:fragment slot="controls">
    <Hst.Checkbox title="Disabled: " bind:value={disabled} />
  </svelte:fragment>
</Hst.Story>

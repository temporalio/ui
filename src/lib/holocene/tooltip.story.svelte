<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  
  import Button from '$lib/holocene/button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';

  export let Hst: HST;
</script>

<Hst.Story>
  <Hst.Variant title="A copyable tooltip">
    <div class="center">
      <Tooltip copyable top text={'Tooltip text goes here.'}>
        <Button as="anchor" href={'#'}>Hover Here</Button>
      </Tooltip>
    </div>
  </Hst.Variant>

  <Hst.Variant title="A multiline tooltip">
    <div class="center">
      <Tooltip
        top
        width={100}
        text={'Really really really really really long tooltip text goes here.'}
      >
        <Button as="anchor" href={'#'}>Hover Here</Button>
      </Tooltip>
    </div>
  </Hst.Variant>

  <Hst.Variant title="A tooltip with attribute top">
    <div class="center">
      <Tooltip top text={'Tooltip text goes here.'}>
        <Button as="anchor" href={'#'}>Hover Here</Button>
      </Tooltip>
    </div>
  </Hst.Variant>

  <Hst.Variant title="A tooltip with attribute topRight">
    <div class="center">
      <Tooltip topRight text={'Tooltip text goes here.'}>
        <Button as="anchor" href={'#'}>Hover Here</Button>
      </Tooltip>
    </div>
  </Hst.Variant>

  <Hst.Variant title="A tooltip with attribute topLeft">
    <div class="center">
      <Tooltip topLeft text={'Tooltip text goes here.'}>
        <Button as="anchor" href={'#'}>Hover Here</Button>
      </Tooltip>
    </div>
  </Hst.Variant>

  <Hst.Variant title="A tooltip with attribute right">
    <div class="center">
      <Tooltip right text={'Tooltip text goes here.'}>
        <Button as="anchor" href={'#'}>Hover Here</Button>
      </Tooltip>
    </div>
  </Hst.Variant>

  <Hst.Variant title="A tooltip with attribute bottom">
    <div class="center">
      <Tooltip bottom text={'Tooltip text goes here.'}>
        <Button as="anchor" href={'#'}>Hover Here</Button>
      </Tooltip>
    </div>
  </Hst.Variant>

  <Hst.Variant title="A tooltip with attribute bottomLeft">
    <div class="center">
      <Tooltip bottomLeft text={'Tooltip text goes here.'}>
        <Button as="anchor" href={'#'}>Hover Here</Button>
      </Tooltip>
    </div>
  </Hst.Variant>

  <Hst.Variant title="A tooltip with attribute bottomRight">
    <div class="center">
      <Tooltip bottomRight text={'Tooltip text goes here.'}>
        <Button as="anchor" href={'#'}>Hover Here</Button>
      </Tooltip>
    </div>
  </Hst.Variant>

  <Hst.Variant title="A tooltip with attribute left">
    <div class="center">
      <Tooltip left text={'Tooltip text goes here.'}>
        <Button as="anchor" href={'#'}>Hover Here</Button>
      </Tooltip>
    </div>
  </Hst.Variant>
</Hst.Story>

<style>
  .center {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 150px;
  }
</style>

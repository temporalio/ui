<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import Chapter from '../_chapter.svelte';
</script>

<Chapter description="A copyable tooltip" props={{}}>
  <div class="center">
    <Tooltip copyable top text={'Tooltip text goes here.'}>
      <Button as="anchor" href={'#'}>Hover Here</Button>
    </Tooltip>
  </div>
</Chapter>

<Chapter description="A multiline tooltip" props={{}}>
  <div class="center">
    <Tooltip
      top
      width={100}
      text={'Really really really really really long tooltip text goes here.'}
    >
      <Button as="anchor" href={'#'}>Hover Here</Button>
    </Tooltip>
  </div>
</Chapter>

<Chapter description="A tooltip with attribute top" props={{}}>
  <div class="center">
    <Tooltip top text={'Tooltip text goes here.'}>
      <Button as="anchor" href={'#'}>Hover Here</Button>
    </Tooltip>
  </div>
</Chapter>

<Chapter description="A tooltip with attribute topRight" props={{}}>
  <div class="center">
    <Tooltip topRight text={'Tooltip text goes here.'}>
      <Button as="anchor" href={'#'}>Hover Here</Button>
    </Tooltip>
  </div>
</Chapter>

<Chapter description="A tooltip with attribute right" props={{}}>
  <div class="center">
    <Tooltip right text={'Tooltip text goes here.'}>
      <Button as="anchor" href={'#'}>Hover Here</Button>
    </Tooltip>
  </div>
</Chapter>

<Chapter description="A tooltip with attribute bottom" props={{}}>
  <div class="center">
    <Tooltip bottom text={'Tooltip text goes here.'}>
      <Button as="anchor" href={'#'}>Hover Here</Button>
    </Tooltip>
  </div>
</Chapter>

<Chapter description="A tooltip with attribute bottomLeft" props={{}}>
  <div class="center">
    <Tooltip bottomLeft text={'Tooltip text goes here.'}>
      <Button as="anchor" href={'#'}>Hover Here</Button>
    </Tooltip>
  </div>
</Chapter>

<Chapter description="A tooltip with attribute bottomRight" props={{}}>
  <div class="center">
    <Tooltip bottomRight text={'Tooltip text goes here.'}>
      <Button as="anchor" href={'#'}>Hover Here</Button>
    </Tooltip>
  </div>
</Chapter>

<Chapter description="A tooltip with attribute left" props={{}}>
  <div class="center">
    <Tooltip left text={'Tooltip text goes here.'}>
      <Button as="anchor" href={'#'}>Hover Here</Button>
    </Tooltip>
  </div>
</Chapter>

<style>
  .center {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 150px;
  }
</style>

<script lang="ts">
  import { Meta, Story } from '@storybook/addon-svelte-csf';

  import ScrollToTop from './scroll-to-top.svelte';

  let container: HTMLDivElement;
  const onScrollToTopClick = () => {
    container.scrollTo(0, 0);
  };
</script>

<Meta title="Scroll to Top" component={ScrollToTop} />

<Story name="scroll to top">
  <div bind:this={container} class="h-[3600px] overflow-auto">
    <button on:click={() => container.scrollTo(0, 3600)}>Scroll Down</button>
  </div>
  <ScrollToTop hidden={false} {onScrollToTopClick} />
  <!-- <Hst.Variant title="Scroll to top of container">
    <div class="h-80 surface-primary p-4 text-center text-lg">Scroll down</div>
    <ScrollToTop scrollToContainer>
      <div class="border-4 border-black">
        <div class="h-screen surface-primary p-4 text-center text-lg">
          Top of container
        </div>
        <div class="h-80 surface-primary" />
      </div>
    </ScrollToTop>
  </Hst.Variant>
  <Hst.Variant title="Custom showOn">
    <div class="h-screen surface-primary p-4 text-center text-lg">Scroll down</div>
    <div class="h-[500px] surface-primary" />
    <div class="h-80 surface-primary text-center text-lg">Button is visible</div>
    <ScrollToTop showOn={500} />
  </Hst.Variant> -->
</Story>

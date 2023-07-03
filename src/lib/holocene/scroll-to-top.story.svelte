<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  
  import ScrollToTop from './scroll-to-top.svelte';

  export let Hst: HST;
</script>

<Hst.Story>
  <Hst.Variant title="Scroll to top of page">
    <div class="h-screen bg-white p-4 text-center text-lg">Scroll down</div>
    <div class="h-80 bg-white" />
    <ScrollToTop />
  </Hst.Variant>
  <Hst.Variant title="Scroll to top of container">
    <div class="h-80 bg-white p-4 text-center text-lg">Scroll down</div>
    <ScrollToTop scrollToContainer>
      <div class="border-4 border-black">
        <div class="h-screen bg-white p-4 text-center text-lg">
          Top of container
        </div>
        <div class="h-80 bg-white" />
      </div>
    </ScrollToTop>
  </Hst.Variant>
  <Hst.Variant title="Custom showOn">
    <div class="h-screen bg-white p-4 text-center text-lg">Scroll down</div>
    <div class="h-[500px] bg-white" />
    <div class="h-80 bg-white text-center text-lg">Button is visible</div>
    <ScrollToTop showOn={500} />
  </Hst.Variant>
</Hst.Story>

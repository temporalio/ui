<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import ScrollToTop from '$lib/holocene/scroll-to-top.svelte';
  import { viewedFeatureTags, viewFeature } from '$lib/stores/new-feature-tags';
  import { onMount } from 'svelte';

  let overlayModal: Modal;
  let scrollToTopHidden = true;
  let showScrollToTopOn = 150; // pixels

  function getScrollContainer(): HTMLElement | null {
    return document.getElementById('content');
  }

  function onScrollToTopClick() {
    getScrollContainer()?.scrollTo(0, 0);
  }

  function handleOnScroll(event: Event) {
    const scrollEvent = event.target as HTMLDivElement;
    const top = scrollEvent.scrollTop;
    scrollToTopHidden = Boolean(top < showScrollToTopOn);
  }

  onMount(() => {
    const viewed = $viewedFeatureTags?.includes('topNav');
    if (!viewed) {
      overlayModal.open();
      viewFeature('topNav');
    }
  });

  const onClose = () => {
    overlayModal.close();
  };
</script>

<main
  id="content"
  class="relative h-screen w-max flex-auto overflow-auto bg-gray-100"
  on:scroll={handleOnScroll}
>
  <slot />
  <ScrollToTop hidden={scrollToTopHidden} {onScrollToTopClick} />
</main>

<Modal
  bind:this={overlayModal}
  data-testid="overlay-modal"
  cancelText="Got it!"
  on:cancelModal={onClose}
  on:confirmModal={onClose}
  hideConfirm
  large
  hightlightNav
>
  <h1 slot="title" data-testid="overlay-title">
    Check out the new top navigation!
  </h1>
  <div slot="content" class="flex flex-col gap-4">
    <div class="flex gap-4 text-base">
      <div><Icon name="namespace-switcher" class="scale-100" /></div>
      Easily switch between Namespaces and know which Namespace you are currently
      on.
    </div>
    <div class="flex gap-4 text-base">
      <Icon name="transcoder-on" status="configured" />
      Set your Coder Server settings and view its status.
    </div>
  </div>
</Modal>

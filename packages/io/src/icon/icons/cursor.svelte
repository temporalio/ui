<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    fill-rule="evenodd"
    d="M14.72 3.786 8.332.09a.66.66 0 0 0-.664 0l-6.39 3.697A.56.56 0 0 0 1 4.27v7.458c0 .2.106.385.28.485l6.388 3.698a.66.66 0 0 0 .664 0l6.389-3.698a.56.56 0 0 0 .279-.485V4.271a.56.56 0 0 0-.28-.484m-.4.784L8.15 15.28c-.042.072-.151.043-.151-.04V8.226a.4.4 0 0 0-.197-.34L1.745 4.38c-.07-.04-.041-.152.042-.152h12.335c.176 0 .285.191.197.343"
    clip-rule="evenodd"
  />
</IconSvgWrapper>

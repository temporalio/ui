<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M10.573 5.365 8.807 2.139 8.001.667l-.808 1.472-1.766 3.226-3.724.621L0 6.27l1.204 1.194 2.636 2.613-.538 3.606-.246 1.65 1.551-.736 3.394-1.607 3.395 1.607 1.548.736-.246-1.65-.538-3.606 2.636-2.613L16 6.27l-1.703-.284z"
  />
</IconSvgWrapper>

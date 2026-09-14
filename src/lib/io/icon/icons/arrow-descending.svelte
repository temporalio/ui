<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="m3.126 13.513.47.455.471-.456 2.658-2.57.47-.456-.94-.908-.471.455-1.523 1.473V2H2.932v9.506l-1.523-1.473-.47-.455-.939.908.47.455 2.659 2.571zM8.69 14h1.993v-1.286H8.026V14zm0-3.429h3.765V9.286h-4.43v1.285zm0-3.428h5.537V5.857H8.026v1.286zm0-3.429H16V2.43H8.026v1.285z"
  />
</IconSvgWrapper>

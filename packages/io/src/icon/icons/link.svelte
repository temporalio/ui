<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M1.115 7.705a3.805 3.805 0 0 0 5.198 5.552l.16-.143-.835-.955-.161.143a2.536 2.536 0 0 1-3.463-3.703l2.997-2.995a2.536 2.536 0 0 1 3.703 3.462l-.143.162.955.836.143-.161a3.806 3.806 0 0 0-5.555-5.198zm13.77.592A3.806 3.806 0 0 0 9.69 2.742l-.161.143.836.955.161-.143A2.536 2.536 0 0 1 13.988 7.4l-2.996 2.997a2.536 2.536 0 0 1-3.703-3.462l.124-.143-.955-.836-.124.143a3.807 3.807 0 0 0 5.557 5.195z"
  />
</IconSvgWrapper>

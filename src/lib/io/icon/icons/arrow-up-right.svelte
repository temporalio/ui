<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M12.281 2.969h.75v9h-1.5V5.53L4.562 12.5l-.53.531-1.063-1.062.531-.531 6.969-6.97H4.03v-1.5z"
  />
</IconSvgWrapper>

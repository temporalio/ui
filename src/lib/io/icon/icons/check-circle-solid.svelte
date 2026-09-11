<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    fill-rule="evenodd"
    d="M13.657 13.657A8 8 0 1 1 2.343 2.342a8 8 0 0 1 11.314 11.315M11.53 6.53l.532-.53L11 4.94l-.531.532L7 8.94 5.531 7.47l-.53-.53L3.94 8l.53.531 2 2 .532.531.531-.53z"
    clip-rule="evenodd"
  />
</IconSvgWrapper>

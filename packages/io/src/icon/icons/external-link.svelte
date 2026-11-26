<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M10.25 0H9.5v1.5h3.94L6.47 8.469 5.937 9 7 10.06l.531-.532L14.5 2.56V6.5H16V0zM.75 1H0v15h15V9h-1.5v5.5h-12v-12H7V1z"
  />
</IconSvgWrapper>

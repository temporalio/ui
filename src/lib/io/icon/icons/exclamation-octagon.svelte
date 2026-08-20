<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M1.5 10.378V5.622L5.622 1.5h4.756L14.5 5.622v4.756L10.378 14.5H5.622zM5 0 0 5v6l5 5h6l5-5V5l-5-5zm3.75 4h-1.5v5h1.5zm-1.5 6v1.5h1.5V10z"
  />
</IconSvgWrapper>

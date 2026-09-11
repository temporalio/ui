<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="m7 1 1.5 2H16v12H0V1zm1.5 3.5h-.75l-.45-.6-1.05-1.4H1.5v11h13v-9zm-3 3v3h-3v-3zm1 0h3v3h-3zm7 0v3h-3v-3z"
  />
</IconSvgWrapper>

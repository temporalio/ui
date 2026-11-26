<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M13.793 2.483H0v1.655h13.793zM16 7.172H2.207v1.656H16zm-2.207 4.69H0v1.655h13.793z"
  />
</IconSvgWrapper>

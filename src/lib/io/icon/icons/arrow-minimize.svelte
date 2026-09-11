<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M15.456 1.63 16 1.084 14.912 0l-.544.541-4.32 4.322V1.34H8.512v6.147h6.144V5.95h-3.523zM.544 14.37 0 14.916 1.088 16l.544-.544 4.32-4.322v3.525h1.536V8.512H1.344v1.537h3.523z"
  />
</IconSvgWrapper>

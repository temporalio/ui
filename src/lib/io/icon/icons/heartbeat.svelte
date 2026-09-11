<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M7.295 1.6h1.387l.103.472 1.73 7.955.93-2.257.152-.373H16v1.2h-3.598l-1.247 3.03-.152.373H9.718l-.103-.473-1.57-7.217-1.652 9.593-.088.497H4.927l-.11-.46-1.29-5.34H0V7.4h4.473l.11.46.952 3.945 1.672-9.708z"
  />
</IconSvgWrapper>

<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M8 6.36 3.283 4 8 1.64 12.717 4zM8 0 0 4l8 4 8-4z"
  /><path
    fill="currentColor"
    d="m2.906 6.544 1.641.822v.003L3.283 8 8 10.36 12.717 8l-1.264-.631 1.642-.822L16 8l-8 4-8-4 1.642-.822z"
  /><path
    fill="currentColor"
    d="m2.906 10.547 1.641.822L3.283 12 8 14.36 12.717 12l-1.264-.631 1.642-.822L16 12l-8 4-8-4z"
  />
</IconSvgWrapper>

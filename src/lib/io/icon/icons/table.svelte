<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M14.06 11.636H1.94v2.425h12.12zM1.94 9.697h12.12V6.303H1.94zm0-7.758v2.425h12.12V1.939zM16 14.061A1.94 1.94 0 0 1 14.06 16H1.94A1.94 1.94 0 0 1 0 14.06V1.94A1.94 1.94 0 0 1 1.94 0h12.12A1.94 1.94 0 0 1 16 1.94z"
  />
</IconSvgWrapper>

<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path fill="currentColor" d="M12.719 0 4.938 16H3.28l7.75-16z" />
</IconSvgWrapper>

<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M8.855 0v6.461l4.693-2.904.904 1.457L9.627 8l4.821 2.986-.903 1.457-4.69-2.904V16H7.141V9.539l-4.693 2.904-.9-1.457L6.37 8 1.548 5.014l.904-1.457L7.14 6.461V0z"
  />
</IconSvgWrapper>

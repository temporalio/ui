<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M15.469 8.533 16 8l-.531-.53-4.25-4.25-.531-.532-1.06 1.062.531.532 2.97 2.968H0v1.5h13.128l-2.969 2.97-.53.53 1.059 1.06.53-.531z"
  />
</IconSvgWrapper>

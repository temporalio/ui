<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M2.893.232V16H1.5V.232zm0 13.218V7.883zm0-5.566V.928s2.553-2.087 5.803 0c3.25 2.086 5.804 0 5.804 0v6.956s-2.554 2.087-5.804 0-5.803 0-5.803 0"
  />
</IconSvgWrapper>

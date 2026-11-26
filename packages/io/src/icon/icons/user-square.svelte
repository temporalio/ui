<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M14.286 1.714v12.572h-.954l-1.332-4H4l-1.332 4h-.954V1.714zm-2.761 12.572h-7.05L5.235 12h5.53zM1.715 0H0v16h16V0zM8 7.429A1.429 1.429 0 1 1 8 4.57a1.429 1.429 0 0 1 0 2.86M4.857 6a3.143 3.143 0 1 0 6.286 0 3.143 3.143 0 0 0-6.286 0"
  />
</IconSvgWrapper>

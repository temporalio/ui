<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M14.857 0C15.464 0 16 .536 16 1.179v13.678A1.15 1.15 0 0 1 14.857 16H1.107C.5 16 0 15.5 0 14.857V1.18C0 .536.5 0 1.107 0zM4.821 13.714V6.107H2.464v7.607zM3.643 5.036C4.393 5.036 5 4.429 5 3.679s-.607-1.393-1.357-1.393c-.786 0-1.393.643-1.393 1.393s.607 1.357 1.393 1.357m10.071 8.678V9.536c0-2.036-.464-3.643-2.857-3.643-1.143 0-1.928.643-2.25 1.25h-.036V6.107h-2.25v7.607H8.68v-3.75c0-1 .178-1.964 1.428-1.964 1.214 0 1.214 1.143 1.214 2v3.714z"
  />
</IconSvgWrapper>

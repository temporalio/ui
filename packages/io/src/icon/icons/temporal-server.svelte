<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    fill-rule="evenodd"
    d="M16 16H0v-5.086h16zM1.5 14.5h13v-2.086h-13zm10.503-.255h-1.17v-1.5h1.17zm1.846 0h-1.17v-1.5h1.17zM16 10.543H0V5.458h16zm-14.5-1.5h13V6.958h-13zm10.503-.293h-1.17v-1.5h1.17zm1.846 0h-1.17v-1.5h1.17zM16 5.086H0V0h16zm-14.5-1.5h13V1.5h-13zm10.503-.332h-1.17v-1.5h1.17zm1.846 0h-1.17v-1.5h1.17z"
    clip-rule="evenodd"
  />
</IconSvgWrapper>

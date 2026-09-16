<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M.856 13.5 0 15h16l-.856-1.5L8.863 2.513 8 1l-.863 1.513zm12.56 0H2.584L8 4.022zM7.25 9.25V10h1.5V6.5h-1.5zm1.5 3.25V11h-1.5v1.5z"
  />
</IconSvgWrapper>

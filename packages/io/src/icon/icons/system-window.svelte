<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M16 1H0v14h16zM1.5 7h13v6.5h-13zM12 3h2v2h-2zm-1 0v2H9V3zM6 3h2v2H6z"
  />
</IconSvgWrapper>

<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M8.75 11.156v.75h-1.5v-8.94L4.281 5.934l-.531.532-1.06-1.06.532-.531L7.469.625 8 .094l.531.531 4.25 4.25.531.531-1.062 1.06-.531-.532L8.75 2.966zm1-.25v-1.5H16v6.5H0v-6.5h6.25v1.5H1.5v3.5h13v-3.5zm2.25 1.75a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0"
  />
</IconSvgWrapper>

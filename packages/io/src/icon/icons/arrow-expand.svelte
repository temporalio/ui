<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="m9.219 5.719-.531.531L9.75 7.31l.531-.532L14.5 2.56V6H16V0h-6v1.5h3.44zM6.78 10.28l.532-.531L6.25 8.69l-.531.532L1.5 13.44V10H0v6h6v-1.5H2.56z"
  />
</IconSvgWrapper>

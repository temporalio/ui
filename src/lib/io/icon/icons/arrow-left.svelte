<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M.531 7.467 0 7.998l.531.532 4.25 4.25.532.53 1.059-1.062-.531-.53-2.97-2.97H16v-1.5H2.872L5.84 4.28l.53-.532L5.31 2.69l-.53.531z"
  />
</IconSvgWrapper>

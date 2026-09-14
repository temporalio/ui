<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="m1.6 9.2-.26.848-.862 2.8-.108.352L0 14.4h11.2l-.37-1.2-.107-.352-.863-2.8L9.6 9.2zm6.72 4H1.625l.37-1.2.492-1.6h6.225l.493 1.6.37 1.2zm.48-8.4a3.2 3.2 0 1 0-6.4 0 3.2 3.2 0 0 0 6.4 0m-5.2 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0M16 14.4l-1.6-4.8h-3.84l1.405 4.565.072.235zM10.8 8c1.547 0 2.8-1.252 2.8-2.8a2.799 2.799 0 0 0-4.458-2.257c.293.555.458 1.187.458 1.857 0 .89-.29 1.713-.782 2.378A2.8 2.8 0 0 0 10.8 8"
  />
</IconSvgWrapper>

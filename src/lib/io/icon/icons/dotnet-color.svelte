<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="#1384C8"
    d="M.928 10.035a.45.45 0 0 1-.137.326.45.45 0 0 1-.332.138.43.43 0 0 1-.324-.138.46.46 0 0 1-.133-.327q0-.194.133-.329a.43.43 0 0 1 .324-.136q.195 0 .332.138a.45.45 0 0 1 .137.327m5.81.37h-.846L2.82 5.699a2 2 0 0 1-.186-.37h-.026q.033.189.033.81v4.266h-.697V4.5h.905l2.98 4.632q.18.275.242.394h.016a6 6 0 0 1-.042-.868V4.501h.694zm4.474 0H8.057V4.5h3.018v.626h-2.32V7.09h2.15v.626h-2.15v2.062h2.457zm4.786-5.278h-1.715v5.278h-.697V5.127h-1.719V4.5h4.131z"
  />
</IconSvgWrapper>

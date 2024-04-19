<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import mp4Logo from '$lib/vendor/Temporal_Logo_Animation.mp4';
  import webmLogo from '$lib/vendor/Temporal_Logo_Animation.webm';

  export let title = translate('common.loading');
</script>

<div
  class="my-12 flex flex-col items-center justify-start gap-4 {$$props.class}"
>
  <video
    autoplay
    loop
    muted
    playsinline
    preload="auto"
    height="160"
    width="160"
    class="dark:invert"
  >
    <source src={mp4Logo} type="video/mp4;codecs=hvc1" />
    <source src={webmLogo} type="video/webm" />
  </video>
  <h2 class="text-xl font-medium">
    {title}
  </h2>
</div>

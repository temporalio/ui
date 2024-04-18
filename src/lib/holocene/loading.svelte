<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import Logo from '$lib/vendor/Temporal_Logo_Animation.mp4';

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
    width="100"
    height="100"
    class="dark:invert-[.92]"
  >
    <source src={Logo} type="video/mp4" />
  </video>
  <h2 class="text-xl font-medium">
    {title}
  </h2>
</div>

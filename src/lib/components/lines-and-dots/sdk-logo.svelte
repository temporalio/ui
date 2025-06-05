<script lang="ts">
  import { fullEventHistory } from '$lib/stores/events';
  import { getSDKandVersion } from '$lib/utilities/get-sdk-version';
  import { isWorkflowTaskCompletedEvent } from '$lib/utilities/is-event-type';
  import dotNet from '$lib/vendor/sdk-logos/dot-net-logo.png';
  import go from '$lib/vendor/sdk-logos/go-logo.png';
  import java from '$lib/vendor/sdk-logos/java-logo.png';
  import php from '$lib/vendor/sdk-logos/php-logo.png';
  import python from '$lib/vendor/sdk-logos/python-logo.png';
  import ruby from '$lib/vendor/sdk-logos/ruby-logo.png';
  import rust from '$lib/vendor/sdk-logos/rust-logo.png';
  import typescript from '$lib/vendor/sdk-logos/ts-logo.png';

  const sdkLogos: Record<string, string> = {
    go,
    typescript,
    java,
    python,
    '.net': dotNet,
    ruby,
    php,
    rust,
  };

  $: workflowCompletedTasks = $fullEventHistory.filter(
    isWorkflowTaskCompletedEvent,
  );

  $: ({ sdk, version } = getSDKandVersion(workflowCompletedTasks));
  $: logo = sdkLogos[sdk.toLowerCase()];
</script>

{#if sdk && version}
  <p class="flex items-center gap-1">
    {#if logo}
      <img src={logo} alt="SDK Icon" class="h-6 w-6" aria-hidden="true" />
    {/if}
    {sdk}
    {version}
  </p>
{/if}

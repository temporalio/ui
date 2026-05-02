<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/state';

  const TRACKING_PIXEL_BASE_URL =
    'https://wpt.tomwheeler.com/cgi-sys/cgiwrap/twheeler/wtp.cgi';
  let trackingPixelURL = $state('');

  const disableTrackingPixel = $derived(
    page.data?.settings?.disableTrackingPixel,
  );

  const uidKey = 'temporal-user-uuid';
  const clusterId = $derived(page.data?.systemInfo?.clusterId);
  const srcId = 'temporal-web-ui';

  onMount(() => {
    if (
      !disableTrackingPixel &&
      !sessionStorage.getItem('session-pixel-fired')
    ) {
      let uuid = localStorage.getItem(uidKey);
      if (!uuid) {
        uuid = crypto.randomUUID();
        localStorage.setItem(uidKey, uuid);
      }
      sessionStorage.setItem('session-pixel-fired', 'true');
      trackingPixelURL = `${TRACKING_PIXEL_BASE_URL}?srcid=${clusterId}:${uuid}:${srcId}`;
    }
  });
</script>

{#if trackingPixelURL}
  <img
    src={trackingPixelURL}
    alt=""
    aria-hidden="true"
    width="1"
    height="1"
    style="position:absolute;left:-9999px"
  />
{/if}

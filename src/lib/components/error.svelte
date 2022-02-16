<script lang="ts">
  export let error: NetworkError & { stack?: string; status: number } = null;

  let ENV =
    typeof process !== 'undefined' && process.env && process.env.NODE_ENV;
  let DEV = ENV !== 'production';

  let status = 500;

  if (error?.status) {
    status = error.status;
  }
  if (error?.statusCode) {
    status = error.statusCode;
  }
  $: currentLocation = window.location.toString();
</script>

<section aria-roledescription="error" class="text-center align-middle mt-32">
  <h1 class="text-[12rem] font-semibold ">{status}</h1>
  <p class="-mt-6 mb-5 text-lg">Uh oh. There's an error.</p>
  <p class="text-lg">
    <a
      href={currentLocation}
      target="_self"
      class="underline-offset-2 underline">Try a refresh</a
    >
    or
    <a href="https://temporal.io/slack" class="underline-offset-2 underline"
      >jump on our Slack Channel</a
    >
  </p>
</section>
{#if DEV}
  <pre class="trace">
        {error?.stack ?? ''}
    </pre>
{/if}

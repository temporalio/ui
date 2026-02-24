<script lang="ts">
  import UserMetadata from '$lib/components/user-metadata.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import type { UserMetadata as IUserMetadata } from '$lib/types';
  import { decodeSingleReadablePayloadWithCodec } from '$lib/utilities/decode-payload';
  import { activityExecution } from '$lib/utilities/standalone-activity-poller.svelte';

  const decodeMetadata = async (userMetadata: IUserMetadata) => {
    const metadata = {
      summary: '',
      details: '',
    };

    if (!userMetadata) return metadata;

    if (userMetadata.summary) {
      const summary = await decodeSingleReadablePayloadWithCodec(
        userMetadata.summary,
      );
      if (typeof summary === 'string') {
        metadata.summary = summary;
      }
    }

    if (userMetadata.details) {
      const details = await decodeSingleReadablePayloadWithCodec(
        userMetadata.details,
      );

      if (typeof details === 'string') {
        metadata.details = details;
      }
    }

    return metadata;
  };
</script>

{#await decodeMetadata($activityExecution?.info?.userMetadata) then { summary, details }}
  <UserMetadata {summary} {details} />
{:catch error}
  <Alert intent="error" title="Error decoding User Metadata">
    {error}
  </Alert>
{/await}

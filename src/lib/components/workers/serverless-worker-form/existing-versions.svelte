<script lang="ts">
  import DeploymentStatus from '$lib/components/deployments/deployment-status.svelte';
  import Timestamp from '$lib/components/timestamp.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    isVersionSummaryNew,
    type VersionSummary,
  } from '$lib/types/deployments';
  import { parseVersionStatus } from '$lib/utilities/deployments';
  import { getBuildIdFromVersion } from '$lib/utilities/get-deployment-build-id';

  interface Props {
    versions: VersionSummary[];
  }

  let { versions }: Props = $props();

  const getBuildId = (version: VersionSummary): string =>
    isVersionSummaryNew(version)
      ? version.deploymentVersion.buildId
      : getBuildIdFromVersion(version.version);

  const getStatus = (version: VersionSummary) =>
    parseVersionStatus(
      isVersionSummaryNew(version) ? version.status : version.drainageStatus,
    );
</script>

{#if versions?.length}
  <div class="mt-4">
    <h3 id="existing-versions-title" class="text-sm font-medium">
      {translate('workers.existing-versions')}
    </h3>
    <ol class="flex flex-col" aria-labelledby="existing-versions-title">
      {#each versions as version, index (index)}
        {@const { status, label } = getStatus(version)}
        <li
          class="flex w-full items-start justify-between gap-2 border-b border-subtle py-2 last-of-type:border-b-0"
        >
          <div class="flex flex-wrap items-center gap-2 truncate">
            <span class="select-all truncate font-mono text-sm"
              >{getBuildId(version)}</span
            >
            <DeploymentStatus {status} {label} />
          </div>
          <Timestamp
            class="shrink-0 text-sm text-secondary"
            as="span"
            dateTime={version.createTime}
            options={{ relative: true }}
          />
        </li>
      {/each}
    </ol>
  </div>
{/if}

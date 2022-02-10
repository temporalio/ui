<script lang="ts">
  import type { NetworkError } from '$lib/utilities/request-from-api';

  throw {
    statusCode: 500,
    statusText: "Shits' broke",
    response: {},
  } as NetworkError;
</script>

<script context="module" lang="ts">
  import { mode } from '$app/env';

  export async function load({}) {
    if (mode !== 'development') {
      return {
        status: 404,
        error: new Error('Could not find page'),
      };
    }

    return {
      status: 200,
    };
  }
</script>

<slot />

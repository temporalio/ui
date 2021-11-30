<script context="module" lang="ts">
  import { mode } from '$app/env';

  /** @type {import('@sveltejs/kit').Load} */
  export async function load({}) {
    let responseObj: any = {
      status: 200,
    };

    if (mode !== 'development') {
      responseObj = {
        status: 404,
        error: new Error('Could not find page'),
      };
    }

    return responseObj;
  }
</script>

<script lang="ts">
  import '../../app.postcss';
</script>

<slot />

<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ page }: LoadInput) {
    const { namespace } = page.params;
    return { status: 302, redirect: `/namespaces/${namespace}/workflows` };
  }
</script>

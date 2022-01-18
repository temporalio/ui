<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ page }: LoadInput) {
    return { status: 302, redirect: `${page.path}/full` };
  }
</script>

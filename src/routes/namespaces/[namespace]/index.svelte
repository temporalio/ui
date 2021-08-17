<script context="module" lang="ts">
  export async function load({ page }) {
    const { namespace } = page.params;
    return { status: 302, redirect: `/namespaces/${namespace}/workflows` };
  }
</script>

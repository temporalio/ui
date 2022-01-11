<script context="module" lang="ts">
  export async function load({ page }) {
    return { status: 302, redirect: `${page.path}/history` };
  }
</script>

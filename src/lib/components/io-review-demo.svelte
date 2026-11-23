<script lang="ts">
  import { Badge } from '$lib/io/badge';
</script>

<section aria-labelledby="io-review-demo-heading" class="space-y-4">
  <h2 id="io-review-demo-heading" class="text-lg font-semibold text-primary">
    Workflow queues
  </h2>
  <ul class="space-y-3">
    <li class="flex items-center justify-between gap-4">
      <span class="text-primary">Payments</span>
      <Badge text="Running" colorScheme="success" />
    </li>
    <li class="flex items-center justify-between gap-4">
      <span class="text-primary">Reports</span>
      <Badge text="" colorScheme="neutral" />
    </li>
  </ul>
</section>

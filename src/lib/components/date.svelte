<script lang="ts">
  import { formatDate } from '$lib/utilities/format-date';
  export let date: string;
</script>

<span>{formatDate(date, 'UTC')}</span>

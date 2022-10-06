<script lang="ts">
  import DatetimePicker from '$lib/holocene/datetime-picker.svelte';

  let currentDate = new Date();

  const onDateChange = (d) => {
    currentDate = d.detail;
  };
</script>

<div class="mt-1/2 mb-2 flex h-screen items-center justify-center">
  <DatetimePicker on:datechange={onDateChange} selected={currentDate} />
</div>

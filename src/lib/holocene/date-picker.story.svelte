<script lang="ts">
  import DatePicker from '$lib/holocene/date-picker.svelte';

  let currentDate = new Date();

  const onDateChange = (d) => {
    currentDate = d.detail;
  };

  export let Hst;
</script>

<Hst.Story>
  <DatePicker on:datechange={onDateChange} selected={currentDate} />
</Hst.Story>

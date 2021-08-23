<script lang="ts">
    import QueuePollersTable from './_queue-pollers-table.svelte';
  </script>
  
<section class="flex flex-col items-start">
    <header>
        <h3>Pollers</h3>
    </header>
      <div class="w-full h-full overflow-x-scroll">
        <QueuePollersTable />

      </div>
  </section>

  <style lang="postcss">
    header {
        padding: 12px;
        margin-bottom: 18px;
    }

    h3 {
        font-size: 24px;
    }
  
  </style>
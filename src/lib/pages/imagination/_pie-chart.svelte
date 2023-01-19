<script lang="ts">
  import * as echarts from 'echarts';
  import { onMount } from 'svelte';
  import type { UsageSeries } from './chart-usage';
  export let seriesData: UsageSeries[] = [];
  export let title: string;
  export let tooltip = true;
  export let valueFormatter: (value: string | number) => string = (value) =>
    value.toLocaleString();

  let pie: HTMLElement;
  let pieChart: echarts.ECharts;

  function drawPieChart() {
    pieChart = echarts.init(pie);
    pieChart.setOption({
      tooltip: {
        trigger: tooltip ? 'item' : '',
        valueFormatter,
        textStyle: {
          fontFamily: 'Inter',
          fontWeight: 400,
        },
      },
      title: {
        text: title,
        left: 'center',
        top: 'center',
        textStyle: {
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 400,
          fontSize: '14',
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['98%', '90%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: false,
              fontSize: '32',
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: seriesData.map(({ label, color, data }) => ({
            value: data[0],
            name: label,
            itemStyle: { color },
          })),
        },
      ],
    });
  }

  onMount(() => {
    drawPieChart();
  });

  function resizer(node: HTMLElement) {
    let cancelFrame = 0;

    const resizeObserver = new ResizeObserver(() => {
      cancelFrame = requestAnimationFrame(() => {
        pieChart.resize();
      });
    });

    resizeObserver.observe(node);

    return {
      destroy() {
        resizeObserver.disconnect();
        cancelAnimationFrame(cancelFrame);
        // the node has been removed from the DOM
      },
    };
  }
</script>

<div class="h-[20vh] w-[50vw] lg:w-[30vh]">
  <div class="h-full w-full" bind:this={pie} use:resizer />
</div>

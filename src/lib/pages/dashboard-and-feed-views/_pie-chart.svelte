<script lang="ts">
  import * as echarts from 'echarts';
  import { onMount } from 'svelte';
  export let totals: Record<string, { count: number; color: string }> = {};
  export let tooltip = true;

  let pie: HTMLElement;
  let pieChart: echarts.ECharts;

  const fullTotal: number = Object.values(totals).reduce(
    (sum, current) => (sum += current.count),
    0,
  );

  function drawPieChart() {
    pieChart = echarts.init(pie);
    pieChart.setOption({
      tooltip: {
        trigger: tooltip ? 'item' : '',
        valueFormatter: (value) => {
          return Math.round((value / fullTotal) * 100).toString() + '%';
        },
        position: ['10%', '100%'],
        textStyle: {
          fontFamily: 'Inter',
          fontWeight: 400,
        },
      },
      title: {
        text: '',
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
          radius: ['100%', '50%'],
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
          data: Object.keys(totals).map((key) => ({
            value: totals[key].count,
            name: key,
            itemStyle: { color: totals[key].color },
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

<div class="h-[64px] w-[64px]">
  <div class="h-full w-full" bind:this={pie} use:resizer />
</div>

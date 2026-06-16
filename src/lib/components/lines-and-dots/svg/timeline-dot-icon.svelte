<script lang="ts">
  export type TimelineIconName =
    | 'signal'
    | 'activity'
    | 'workflow'
    | 'retention'
    | 'feather'
    | 'relationship'
    | 'update'
    | 'terminal'
    | 'retry'
    | 'pause'
    | 'nexus';

  interface Props {
    name: TimelineIconName;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  }

  let {
    name,
    x = undefined,
    y = undefined,
    width = 16,
    height = 16,
  }: Props = $props();
</script>

<use href="#tl-icon-{name}" {x} {y} {width} {height} style="color:black" />

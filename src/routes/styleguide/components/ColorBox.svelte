<script lang="ts">
  export let name: string;
  export let hexColor: string;
</script>

<div>
  <div style={`background-color:${hexColor};`} class="h-20 rounded" />
  <div class="grid grid-cols-2">
    <span class="font-bold text-blueGray-900 capitalize">{name}</span>
    <span class="text-right text-warmGray-600">{hexColor}</span>
  </div>
</div>

<script setup lang="ts">
import SimulationRender from '@/components/SimulationRender.vue'
import History from '@/components/History.vue'
import type { CyElementsArray, GraphProblem } from '@/types'
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useFileStore } from '@/stores/file'
import graphProblemExample from 'input.json'

const fileStore = useFileStore()
const { graphProblemObj } = storeToRefs(fileStore)
</script>

<template>
  <div class="simulation">
    <input
      v-if="graphProblemObj"
      v-model="graphProblemObj.name"
      class="graph-problem-name"
      placeholder="untitled"
      @keydown.stop
      @keyup.stop
      @keypress.stop
    />
    <div class="graph-problem-content">
      <SimulationRender v-if="graphProblemObj" :graph-problem="graphProblemObj" />
      <div class="no-graph" v-else>No graph problem loaded</div>
      <History v-if="graphProblemObj" />
    </div>
  </div>
</template>

<style>
.simulation {
  padding: var(--s-xl) 8%;
}
.graph-problem-name {
  text-align: center;
  padding-bottom: var(--s-m);

  /* Remove input styling */
  background: transparent;
  border: none;
  outline: none;

  /* Match text styling */
  font-size: inherit;
  font-family: inherit;
  font-weight: inherit;
  color: inherit;

  /* Layout */
  width: 100%;
  display: block;
  padding-bottom: var(--s-m);
}
.graph-problem-content {
  display: grid;
  grid-template-columns: auto 10em;
  min-height: 80vh;
}
.no-graph {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: var(--fs-m);
}
</style>

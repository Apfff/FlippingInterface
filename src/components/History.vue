<script setup lang="ts">
import { useHistoryStore } from '@/stores/history'
import { storeToRefs } from 'pinia'

const historyStore = useHistoryStore()
const { addedEdges, removedEdges, step, currentStep, highlightedNodes, highlightedEdges } =
  storeToRefs(historyStore)

const highlightPair = (nodeId1: string, nodeId2: string, edgeId: string) => {
  const nodeIndex1 = highlightedNodes.value.indexOf(nodeId1)
  const nodeIndex2 = highlightedNodes.value.indexOf(nodeId2)
  if (nodeIndex1 != -1 && nodeIndex2 != -1) {
    highlightedNodes.value = []
    highlightedEdges.value = []
  } else {
    highlightedNodes.value = [nodeId1, nodeId2]
    highlightedEdges.value = [edgeId]
  }
}

const edgeTitle = (edge: { source: string; target: string }) => {
  return `${edge.source}:${edge.target}`
}
</script>

<template>
  <div class="history">
    {{ highlightedEdges }}
    <div class="step">Step: {{ currentStep }}</div>
    <div class="history-lists">
      <div class="list removed-edges">
        <div v-if="removedEdges.length > 0">
          <div v-for="(edge, index) in removedEdges" :key="edge.id">
            <div
              class="edge-entry"
              :class="{
                current: index === currentStep - 1,
                highlighted:
                  highlightedNodes.includes(edge.source) && highlightedNodes.includes(edge.target),
              }"
              @click="highlightPair(edge.source, edge.target, edge.id!)"
            >
              {{ edgeTitle(edge) }}
            </div>
          </div>
        </div>
      </div>
      <div class="list added-edges">
        <div v-if="addedEdges.length > 0">
          <div v-for="(edge, index) in addedEdges" :key="edge.id">
            <div
              class="edge-entry"
              :class="{
                current: index === currentStep - 1,
                highlighted:
                  highlightedNodes.includes(edge.source) && highlightedNodes.includes(edge.target),
              }"
              @click="highlightPair(edge.source, edge.target, edge.id!)"
            >
              {{ edgeTitle(edge) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.history-lists {
  display: grid;
  grid-template-columns: 1fr 1fr;

  max-height: 80vh;
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Edge */
}
.history-lists::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
.added-edges {
  .current {
    background-color: #28a74580;
    border-radius: var(--s-m);
  }
}
.removed-edges {
  .current {
    background-color: #dc354580;
    border-radius: var(--s-m);
  }
}
.list {
  text-align: center;
  padding: 0 var(--s-s);
}
.step {
  text-align: center;
}
.edge-entry {
  border-radius: 3px;
  border: 2px solid transparent;
  cursor: pointer;
}
.highlighted {
  border: 2px solid #ffd256;
}
</style>

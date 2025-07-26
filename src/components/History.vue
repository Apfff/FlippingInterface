<script setup lang="ts">
import { useHistoryStore } from '@/stores/history'
import { storeToRefs } from 'pinia'

const historyStore = useHistoryStore()
const { addedEdges, removedEdges, step, currentStep } = storeToRefs(historyStore)
</script>

<template>
  <div class="history">
    <div class="step">Step: {{ currentStep }}</div>
    <div class="history-lists">
      <div class="list removed-edges">
        <div v-if="removedEdges.length > 0">
          <div v-for="(edge, index) in removedEdges" :key="edge.id">
            <div :class="{ current: index === currentStep - 1 }">{{ edge.id }}</div>
          </div>
        </div>
      </div>
      <div class="list added-edges">
        <div v-if="addedEdges.length > 0">
          <div v-for="(edge, index) in addedEdges" :key="edge.id">
            <div :class="{ current: index === currentStep - 1 }">{{ edge.id }}</div>
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
</style>

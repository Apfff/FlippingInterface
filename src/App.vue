<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useRouter } from 'vue-router'
import type { GraphProblem } from './types'
import { useFileStore } from './stores/file'
import { storeToRefs } from 'pinia'

document.title = 'Flipping Interface'

const router = useRouter()
const importCounter = ref(0)
const fileInput = ref<HTMLInputElement | null>(null)
const fileStore = useFileStore()
const { graphProblemObj } = storeToRefs(fileStore)

const importGraphProblem = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  if (!file.name.endsWith('.json') && file.type !== 'application/json') {
    alert('Please select a JSON file')
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      const graphProblem: GraphProblem = JSON.parse(content)
      if (!graphProblem.nodes || !graphProblem.startEdges || !graphProblem.targetEdges) {
        alert('Invalid JSON structure. Missing required fields: nodes, startEdges, or targetEdges')
        return
      }
      graphProblemObj.value = graphProblem
      importCounter.value += 1
      router.push('/')
    } catch (error) {
      alert('Error parsing JSON file: ' + error)
    }
  }
  reader.onerror = () => {
    alert('Error reading file')
  }
  reader.readAsText(file)
  target.value = ''
}

const downloadGraphProblem = () => {
  fileStore.downloadCurrentGraphProblem()
}
</script>

<template>
  <header>
    <div></div>
    <div id="title">Interface</div>
    <div class="buttons">
      <div class="button" @click="importGraphProblem">import</div>
      <input
        ref="fileInput"
        type="file"
        accept=".json,application/json"
        @change="handleFileSelect"
        style="display: none"
      />
      <div class="button" v-show="graphProblemObj" @click="downloadGraphProblem">download</div>
    </div>
  </header>
  <main>
    <RouterView :key="importCounter" />
  </main>
</template>

<style scoped>
header {
  background-color: var(--c-bg-soft);
  height: var(--header-height);
  position: fixed;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: var(--s-xl);
}
.buttons {
  display: flex;
  gap: var(--s-xl);
  align-items: center;
}
main {
  padding-top: var(--header-height);
}
#title {
  text-align: center;
  font-size: 2em;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import type { GraphProblem } from '@/types'
import { useHistoryStore } from './history'
import { useModeStore } from './mode'

export const useFileStore = defineStore('file', () => {
  const historyStore = useHistoryStore()
  const modeStore = useModeStore()
  const { currentMode } = storeToRefs(modeStore)
  const { addedEdges, removedEdges } = storeToRefs(historyStore)

  const graphProblemObj = ref<GraphProblem | null>(null)
  const editorGraphObj = ref<GraphProblem | null>(null)

  function includeHistory(graphProblem: GraphProblem) {
    if (!graphProblem) return
    graphProblem.steps = []
    if (addedEdges.value.length !== removedEdges.value.length) {
      console.error('Added edges and removed edges do not match in length.')
      return
    }
    for (let i = 0; i < addedEdges.value.length; i++) {
      graphProblem.steps.push({
        added: addedEdges.value[i],
        removed: removedEdges.value[i],
      })
    }
  }

  function downloadCurrentGraphProblem() {
    let graphProblem: GraphProblem | null = null
    if (currentMode.value === 'editor') {
      if (!editorGraphObj.value) return
      graphProblem = { ...editorGraphObj.value }
    } else {
      if (!graphProblemObj.value) return
      graphProblem = { ...graphProblemObj.value }
      includeHistory(graphProblem)
    }
    const jsonString = JSON.stringify(graphProblem, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${graphProblem.name || 'untitled'}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return { graphProblemObj, editorGraphObj, downloadCurrentGraphProblem }
})

import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import type { GraphProblem, GraphProblemExport } from '@/types'
import { useHistoryStore } from './history'
import { useModeStore } from './mode'

export const useFileStore = defineStore('file', () => {
  const historyStore = useHistoryStore()
  const modeStore = useModeStore()
  const { currentMode } = storeToRefs(modeStore)
  const { addedEdges, removedEdges } = storeToRefs(historyStore)

  const graphProblemObj = ref<GraphProblem | null>(null)
  const editorGraphObj = ref<GraphProblem | null>(null)

  const alternativeJson = ref<boolean>(false)

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
    const exportObj = alternativeJson.value
      ? generateGraphProblemExport(graphProblem)
      : graphProblem
    const jsonString = JSON.stringify(exportObj, null, 2)
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

  function generateGraphProblemExport(graphProblem: GraphProblem): GraphProblemExport {
    const pointsMap = new Map<string, number>()
    let i = 0
    graphProblem.nodes.forEach((node) => {
      pointsMap.set(node.id, i++)
    })
    const content_type = 'APFFF_web_interface'
    const instance_uid = graphProblem.name || 'untitled_instance'
    const points_x = Array.from(new Set(graphProblem.nodes.map((node) => node.x)))
    const points_y = Array.from(new Set(graphProblem.nodes.map((node) => node.y)))
    const triangulations: [number, number][] = graphProblem.startEdges.map((edge) => [
      pointsMap.get(edge.source)!,
      pointsMap.get(edge.target)!,
    ])
    return {
      content_type,
      instance_uid,
      points_x,
      points_y,
      triangulations,
    }
  }

  return { graphProblemObj, editorGraphObj, alternativeJson, downloadCurrentGraphProblem }
})

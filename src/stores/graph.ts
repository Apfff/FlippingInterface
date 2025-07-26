import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { EdgeData } from '@/types'

export const useGraphStore = defineStore('graph', () => {
  const previewTarget = ref(false)
  const currentEdges = ref<EdgeData[]>([])
  const targetEdges = ref<EdgeData[]>([])

  function getTargetCurrentOverlap(): string[] {
    const overlapEdges = targetEdges.value.filter((edge) =>
      currentEdges.value.some(
        (currentEdge) =>
          (currentEdge.source === edge.source && currentEdge.target === edge.target) ||
          (currentEdge.source === edge.target && currentEdge.target === edge.source),
      ),
    )
    return overlapEdges.map((edge) => edge.id!)
  }
  return { previewTarget, currentEdges, targetEdges, getTargetCurrentOverlap }
})

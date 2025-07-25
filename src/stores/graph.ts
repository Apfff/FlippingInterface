import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { EdgeData } from '@/types'

export const useGraphStore = defineStore('graph', () => {
  const previewTarget = ref(false)
  const currentEdges = ref<EdgeData[]>([])
  const targetEdges = ref<EdgeData[]>([])

  return { previewTarget, currentEdges, targetEdges }
})

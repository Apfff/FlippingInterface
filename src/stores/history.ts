import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { EdgeData, Step } from '@/types'

export const useHistoryStore = defineStore('history', () => {
  const step = ref(0)
  const currentStep = ref(0)
  const addedEdges = ref<EdgeData[]>([])
  const removedEdges = ref<EdgeData[]>([])
  //hacky
  const highlightedNodes = ref<string[]>([])

  function makeStep(newEdge: EdgeData, removedEdge: EdgeData) {
    if (currentStep.value < step.value) {
      addedEdges.value.splice(currentStep.value)
      removedEdges.value.splice(currentStep.value)
    }
    addedEdges.value.push(newEdge)
    removedEdges.value.push(removedEdge)
    currentStep.value++
    step.value = currentStep.value
  }

  function undo(cy: cytoscape.Core) {
    if (currentStep.value === 0) return
    const addedEdgeData = addedEdges.value[currentStep.value - 1]
    const removedEdgeData = removedEdges.value[currentStep.value - 1]
    cy.batch(() => {
      cy.edges().unselect()
      cy.edges().removeClass('flip-edge-new')
      cy.getElementById(addedEdgeData.id!).remove()
      cy.add({
        group: 'edges',
        data: removedEdgeData,
        classes: 'flip-edge-new',
      })
    })
    currentStep.value -= 1
  }

  function redo(cy: cytoscape.Core) {
    if (currentStep.value === step.value) return
    const addedEdgeData = addedEdges.value[currentStep.value]
    const removedEdgeData = removedEdges.value[currentStep.value]
    cy.batch(() => {
      cy.edges().unselect()
      cy.edges().removeClass('flip-edge-new')
      cy.getElementById(removedEdgeData.id!).remove()
      cy.add({
        group: 'edges',
        data: addedEdgeData,
        classes: 'flip-edge-new',
      })
    })
    currentStep.value += 1
  }

  function importHistory(history: Step[]) {
    addedEdges.value = []
    removedEdges.value = []
    history.forEach((step) => {
      addedEdges.value.push({
        id: step.added.id,
        source: step.added.source,
        target: step.added.target,
      })
      removedEdges.value.push({
        id: step.removed.id,
        source: step.removed.source,
        target: step.removed.target,
      })
    })
    step.value = history.length
    currentStep.value = 0
  }

  return {
    step,
    makeStep,
    addedEdges,
    removedEdges,
    currentStep,
    undo,
    redo,
    importHistory,
    highlightedNodes,
  }
})

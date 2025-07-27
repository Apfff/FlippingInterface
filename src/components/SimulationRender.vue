<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import cytoscape from 'cytoscape'
import { useHistoryStore } from '../stores/history'
import type { CyElement, CyElementsArray, EdgeData, GraphProblem } from '@/types'
import { cyConfig } from '@/configs'
import { storeToRefs } from 'pinia'
import { useGraphStore } from '@/stores/graph'
import { GraphService } from '@/services/GraphService'
import { useSettingsStore } from '@/stores/settings'

interface Props {
  graphProblem: GraphProblem
}
const props = defineProps<Props>()

const graphStore = useGraphStore()
const { previewTarget, targetEdges, currentEdges } = storeToRefs(graphStore)
const historyStore = useHistoryStore()
const { addedEdges, removedEdges, step, currentStep, highlightedNodes } = storeToRefs(historyStore)
const graphService = new GraphService()
const settingsStore = useSettingsStore()
const { showTargetOverlap } = storeToRefs(settingsStore)

//bootstrapping the graph
const graphProblemWithIDs = graphService.graphProblemGenerateIds(props.graphProblem)
targetEdges.value = graphProblemWithIDs.targetEdges
historyStore.importHistory(graphProblemWithIDs.steps)

let keyPressHandler: ((event: KeyboardEvent) => void) | null = null
let keyReleaseHandler: ((event: KeyboardEvent) => void) | null = null
const cyContainer = ref(null)
const edgeFlipCandidateID = ref<string>('')
let cy: cytoscape.Core | null = null

onMounted(() => {
  cy = cytoscape({
    container: cyContainer.value,
    elements: graphService.graphProblemToCyElements(graphProblemWithIDs),
    style: [
      {
        selector: 'node',
        style: {
          'background-color': cyConfig.nodeColor,
          width: cyConfig.nodeSize,
          height: cyConfig.nodeSize,
          label: 'data(id)',
          color: cyConfig.textColor,
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': cyConfig.fontSize,
          events: 'yes',
        },
      },
      {
        selector: 'node.highlighted',
        style: {
          'background-color': cyConfig.nodeColorHighlighted,
        },
      },
      {
        selector: 'edge',
        style: {
          width: cyConfig.edgeWidth,
          'line-color': cyConfig.edgeColor,
          events: 'yes',
        },
      },
      {
        selector: 'edge.flip-edge-invalid',
        style: {
          'line-color': cyConfig.edgeColorInvalid,
        },
      },
      {
        selector: 'edge.flip-edge-valid',
        style: {
          'line-color': cyConfig.edgeColorValid,
        },
      },
      {
        selector: 'edge.flip-edge-neighbor',
        style: {
          'line-color': cyConfig.edgeColorNeighbor,
        },
      },
      {
        selector: 'edge.flip-edge-new',
        style: {
          'line-color': cyConfig.edgeColorNew,
        },
      },
      {
        selector: 'edge.correct',
        style: {
          'line-color': cyConfig.edgeColorCorrect,
        },
      },
    ],
    layout: cyConfig.layout,
    userZoomingEnabled: true,
    userPanningEnabled: true,
    boxSelectionEnabled: true,
    autounselectify: false,
    motionBlur: false,
    wheelSensitivity: cyConfig.wheelSensitivity,
  })

  cy.on('select', 'edge', (event) => {
    if (!cy) return
    cy.edges().removeClass('flip-edge-new')
    const edge = event.target
    const commonNeighbors = graphService.getRelevantNeighbors(cy, edge.id())
    if (commonNeighbors.length < 2) {
      edge.addClass('flip-edge-invalid')
    } else if (commonNeighbors.length == 2) {
      edgeFlipCandidateID.value = edge.id()
      edge.addClass('flip-edge-valid')
    } else {
      console.error('Unexpected number of common neighbors:', commonNeighbors.length)
    }
    const nodes = edge.connectedNodes()
    const node1 = nodes[0]
    const node2 = nodes[1]
    commonNeighbors.forEach((commonNode: { edgesWith: (arg0: any) => any }) => {
      const edgesToNode1 = commonNode.edgesWith(node1)
      const edgesToNode2 = commonNode.edgesWith(node2)
      edgesToNode1.addClass('flip-edge-neighbor')
      edgesToNode2.addClass('flip-edge-neighbor')
    })
  })
  cy.on('unselect', 'edge', (event) => {
    edgeFlipCandidateID.value = ''
    if (cy) {
      cy.edges().removeClass('flip-edge-neighbor')
      cy.edges().removeClass('flip-edge-invalid')
      cy.edges().removeClass('flip-edge-valid')
      cy.edges().removeClass('flip-edge-new')
    }
  })
  cy.on('tap', (event) => {
    if (cy && event.target === cy) {
      cy.edges().removeClass('flip-edge-new')
    }
  })

  keyPressHandler = (event: KeyboardEvent) => {
    if (event.code === 'Space') {
      event.preventDefault()
      if (!edgeFlipCandidateID.value || !cy) return
      const flipResult = graphService.flipEdge(cy, edgeFlipCandidateID.value)
      if (flipResult && flipResult.oldEdge && flipResult.newEdge) {
        historyStore.makeStep(flipResult.newEdge, flipResult.oldEdge)
      }
    }
    if (event.code == 'ArrowLeft' && !event.repeat) {
      event.preventDefault()
      if (!cy) return
      historyStore.undo(cy)
    }
    if (event.code == 'ArrowRight' && !event.repeat) {
      event.preventDefault()
      if (!cy) return
      historyStore.redo(cy)
    }
    if (event.code === 'KeyR' && !event.repeat) {
      event.preventDefault()
      previewTarget.value = true
      if (!cy) return
      currentEdges.value = graphService.extractEdgeData(cy)
      graphService.changeEdgeData(cy, targetEdges.value)
      if (showTargetOverlap.value) {
        const overlapEdgesIDs = graphStore.getTargetCurrentOverlap()
        for (const edgeId of overlapEdgesIDs) {
          const cyEdge = cy.getElementById(edgeId)
          if (cyEdge) {
            cyEdge.addClass('correct')
          }
        }
      }
    }
  }
  keyReleaseHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyR') {
      event.preventDefault()
      if (cy) {
        graphService.changeEdgeData(cy, currentEdges.value)
        cy.edges().removeClass('correct')
      }
      previewTarget.value = false
    }
  }

  document.addEventListener('keydown', keyPressHandler)
  document.addEventListener('keyup', keyReleaseHandler)
})

onBeforeUnmount(() => {
  if (keyPressHandler) {
    document.removeEventListener('keydown', keyPressHandler)
    keyPressHandler = null
  }
  if (keyReleaseHandler) {
    document.removeEventListener('keyup', keyReleaseHandler)
    keyReleaseHandler = null
  }
  if (cy) {
    cy.destroy()
    cy = null
  }
})

watch(previewTarget, (newValue) => {
  if (!cy) return
  if (newValue) {
    cy.edges().unselectify()
    cy.edges().unselect()
    cy.style().selector('edge').style('events', 'no').update()
  } else {
    cy.edges().selectify()
    cy.style().selector('edge').style('events', 'yes').update()
  }
})
watch(highlightedNodes, (nodes) => {
  console.log('highlightedNodes:', highlightedNodes.value)
  if (!cy) return
  cy.nodes().removeClass('highlighted')
  nodes.forEach((nodeId) => {
    cy!.getElementById(nodeId).addClass('highlighted')
  })
})
</script>

<template>
  <div ref="cyContainer" class="cy-container" tabindex="-1"></div>
</template>

<style scoped>
.cy-container {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 100%;
  border: 4px solid var(--c-border);
  border-radius: 8px;
}
</style>

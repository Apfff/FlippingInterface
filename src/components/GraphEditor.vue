<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import cytoscape from 'cytoscape'
import { cyConfig } from '@/configs'
import { useFileStore } from '@/stores/file'
import { storeToRefs } from 'pinia'
import type { GraphProblem, NodeData, EdgeData } from '@/types'

const fileStore = useFileStore()
const { editorGraphObj } = storeToRefs(fileStore)

let keyPressHandler: ((event: KeyboardEvent) => void) | null = null
const cyContainer = ref(null)
let cy: cytoscape.Core | null = null
let nodeIdCounter = ref(0)

const updateEditorGraphObj = () => {
  if (!cy) return
  const nodes: NodeData[] = cy.nodes().map((node) => ({
    id: node.id(),
    x: Math.round(node.position().x),
    y: Math.round(node.position().y),
  }))
  const edges: EdgeData[] = cy.edges().map((edge) => ({
    source: edge.source().id(),
    target: edge.target().id(),
  }))
  const updatedGraphProblem: GraphProblem = {
    nodes: nodes,
    startEdges: edges,
    targetEdges: edges,
    steps: [],
  }
  editorGraphObj.value = updatedGraphProblem
}

function renameNodesToAlphabeticalOrder() {
  if (!cy) return
  // Get all nodes and sort them by their current IDs
  const allNodes = cy.nodes().sort((a, b) => a.id().localeCompare(b.id()))
  const nodePositions = new Map<string, any>()
  const edgeData: Array<{ source: string; target: string }> = []
  allNodes.forEach((node) => {
    nodePositions.set(node.id(), node.position())
  })
  cy.edges().forEach((edge) => {
    edgeData.push({
      source: edge.source().id(),
      target: edge.target().id(),
    })
  })
  // Remove all nodes and edges
  cy.elements().remove()
  // Recreate nodes with new alphabetical IDs
  const newNodes: Array<{ data: { id: string }; position: any }> = []
  allNodes.forEach((node, index) => {
    const newId = String.fromCharCode(97 + index) // 97 is 'a' in ASCII
    const position = nodePositions.get(node.id())
    newNodes.push({
      data: { id: newId },
      position: position,
    })
  })
  // Add new nodes
  cy.add(newNodes)
  // Recreate edges with new node IDs
  const newEdges: Array<{ data: { id: string; source: string; target: string } }> = []
  edgeData.forEach((edge) => {
    // Find the new IDs for source and target
    const sourceIndex = Array.from(nodePositions.keys()).indexOf(edge.source)
    const targetIndex = Array.from(nodePositions.keys()).indexOf(edge.target)
    if (sourceIndex !== -1 && targetIndex !== -1) {
      const newSourceId = String.fromCharCode(97 + sourceIndex)
      const newTargetId = String.fromCharCode(97 + targetIndex)
      newEdges.push({
        data: {
          id: `${newSourceId}${newTargetId}`,
          source: newSourceId,
          target: newTargetId,
        },
      })
    }
  })
  cy.add(newEdges)
  nodeIdCounter.value = allNodes.length
}

onMounted(() => {
  cy = cytoscape({
    container: cyContainer.value,
    elements: [],
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
          'font-size': `${cyConfig.fontSize}px`,
          events: 'yes',
        },
      },
      {
        selector: 'node.selected',
        style: {
          'background-color': cyConfig.nodeColorHighlighted,
        },
      },
      {
        selector: 'edge',
        style: {
          width: cyConfig.edgeWidth,
          'line-color': cyConfig.edgeColor,
        },
      },
    ],
    layout: {
      name: 'preset',
    },
    zoom: cyConfig.editorDefaultZoom,
    userZoomingEnabled: true,
    userPanningEnabled: true,
    autounselectify: false,
    motionBlur: false,
    boxSelectionEnabled: true,
    wheelSensitivity: cyConfig.wheelSensitivity,
  })

  // Add event listeners for selection
  cy.on('select', 'node', (event) => {
    const node = event.target
    node.addClass('selected')
  })

  cy.on('unselect', 'node', (event) => {
    const node = event.target
    node.removeClass('selected')
  })

  keyPressHandler = (event: KeyboardEvent) => {
    //add node
    if (event.code === 'Space') {
      event.preventDefault()
      if (!cy) return
      const nodeId = String.fromCharCode(97 + nodeIdCounter.value) // 97 is 'a' in ASCII
      const extent = cy.extent()
      const centerX = (extent.x1 + extent.x2) / 2
      const centerY = (extent.y1 + extent.y2) / 2
      const newNode = {
        data: { id: nodeId },
        position: {
          x: centerX,
          y: centerY,
        },
      }
      cy.add(newNode)
      nodeIdCounter.value++
      updateEditorGraphObj()
    }
    //add edge
    if (event.code === 'KeyE') {
      event.preventDefault()
      if (!cy) return
      const selectedNodes = cy.nodes(':selected')
      if (selectedNodes.length === 2) {
        const node1 = selectedNodes[0]
        const node2 = selectedNodes[1]
        const edgeId = `${node1.id()}${node2.id()}`
        const existingEdge = cy.getElementById(edgeId)
        if (existingEdge.length === 0) {
          const newEdge = {
            data: {
              id: edgeId,
              source: node1.id(),
              target: node2.id(),
            },
          }
          cy.add(newEdge)
          updateEditorGraphObj()
        }
      }
    }
    //remove node
    if (event.code === 'Delete' || event.code === 'Backspace') {
      event.preventDefault()
      if (!cy) return
      const selectedNodes = cy.nodes(':selected')
      if (selectedNodes.length > 0) {
        selectedNodes.remove()
        renameNodesToAlphabeticalOrder()
        updateEditorGraphObj()
      }
    }
  }
  document.addEventListener('keydown', keyPressHandler)
})

onBeforeUnmount(() => {
  if (keyPressHandler) {
    document.removeEventListener('keydown', keyPressHandler)
    keyPressHandler = null
  }
  if (cy) {
    cy.destroy()
    cy = null
  }
})
</script>

<template>
  <div class="graph-editor">
    <div ref="cyContainer" class="cy-container"></div>
  </div>
</template>

<style lang="scss">
.graph-editor {
  width: 100%;
  height: 100%;
}
.cy-container {
  width: 100%;
  height: 100%;
  border: 4px solid var(--c-border);
  border-radius: 8px;
}
</style>

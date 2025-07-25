import { useGraphStore } from '@/stores/graph'
import type { CyElement, CyElements, CyElementsArray, EdgeData, GraphProblem } from '@/types'
import { storeToRefs } from 'pinia'

export class GraphService {
  public flipEdge(
    cy: cytoscape.Core,
    edgeID: string,
  ): { oldEdge: EdgeData; newEdge: EdgeData } | void {
    if (!edgeID || !cy) {
      return
    }
    const oldEdge = cy.getElementById(edgeID)
    const commonNeighbors = this.getRelevantNeighbors(cy, edgeID)
    const neighbor1 = commonNeighbors[0]
    const neighbor2 = commonNeighbors[1]
    const newEdgeId = `${neighbor1.id()}${neighbor2.id()}`
    //data for history
    const newEdgeData: EdgeData = {
      id: newEdgeId,
      source: neighbor1.id(),
      target: neighbor2.id(),
    }
    const oldEdgeData: EdgeData = {
      id: oldEdge.id(),
      source: oldEdge.source().id(),
      target: oldEdge.target().id(),
    }
    //actually add to graph
    cy.batch(() => {
      oldEdge.unselect()
      oldEdge.remove()
      cy.add({
        group: 'edges',
        data: newEdgeData,
        classes: 'flip-edge-new',
      })
    })
    return { oldEdge: oldEdgeData, newEdge: newEdgeData }
  }

  public getRelevantNeighbors(cy: cytoscape.Core, edgeID: string) {
    const edge = cy.getElementById(edgeID)
    const nodes = edge.connectedNodes()
    const node1 = nodes[0]
    const node2 = nodes[1]

    const neighbors1 = node1.neighborhood('node')
    const neighbors2 = node2.neighborhood('node')
    const commonNeighbors = neighbors1.intersection(neighbors2)
    return commonNeighbors
  }

  public extractEdgeData(cy: cytoscape.Core): EdgeData[] {
    const edgeData: EdgeData[] = []
    const edges = cy.json().elements.edges
    if (!edges || edges.length === 0) {
      return edgeData
    }
    for (const edge of edges) {
      edgeData.push(edge.data as EdgeData)
    }
    return edgeData
  }

  public changeEdgeData(cy: cytoscape.Core, edgeData: EdgeData[]) {
    cy.batch(() => {
      cy.edges().unselect()
      cy.edges().remove()
      edgeData.forEach((element) => {
        cy.add({
          group: 'edges',
          data: element,
        })
      })
    })
  }

  public graphProblemToCyElements(graphProblem: GraphProblem): CyElementsArray {
    const elements: CyElementsArray = []
    graphProblem.nodes.forEach((nodeData) => {
      elements.push({
        data: nodeData,
      } as CyElement)
    })
    graphProblem.startEdges.forEach((edgeData) => {
      elements.push({
        data: edgeData,
      } as CyElement)
    })
    return elements
  }

  public graphProblemGenerateIds(graphProblem: GraphProblem): GraphProblem {
    graphProblem.startEdges.forEach((edge) => {
      if (!edge.id) {
        edge.id = `${edge.source}${edge.target}`
      }
    })
    graphProblem.targetEdges.forEach((edge) => {
      if (!edge.id) {
        edge.id = `${edge.source}${edge.target}`
      }
    })
    graphProblem.steps.forEach((step) => {
      if (!step.added.id) {
        step.added.id = `${step.added.source}${step.added.target}`
      }
      if (!step.removed.id) {
        step.removed.id = `${step.removed.source}${step.removed.target}`
      }
    })
    return graphProblem
  }
}

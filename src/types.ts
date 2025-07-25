export interface EdgeData {
  id?: string
  source: string
  target: string
}
export interface NodeData {
  id: string
}

export interface Step {
  added: EdgeData
  removed: EdgeData
}

export interface GraphProblem {
  name?: string
  nodes: NodeData[]
  startEdges: EdgeData[]
  targetEdges: EdgeData[]
  steps: Step[]
}

export interface CyNodeElement {
  data: NodeData
  group?: 'nodes'
  classes?: string
}

export interface CyEdgeElement {
  data: EdgeData
  group?: 'edges'
  classes?: string
}

export type CyElement = CyNodeElement | CyEdgeElement

export interface CyElements {
  nodes?: CyNodeElement[]
  edges?: CyEdgeElement[]
}

export type CyElementsArray = CyElement[]

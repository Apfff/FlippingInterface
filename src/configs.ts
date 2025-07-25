export const cyConfig = {
  nodeColor: '#c9c9c9',
  textColor: '#000000',
  nodeSize: 10,
  fontSize: '6px',
  edgeColor: '#4a4a4a',
  edgeColorInvalid: '#FF4136',
  edgeColorValid: '#2ECC40',
  edgeColorNeighbor: '#999999',
  edgeColorNew: '#358dda',
  edgeColorCorrect: '#d3c260',
  edgeWidth: 2,
  wheelSensitivity: 1.5,
  layout: {
    name: 'cose',
    idealEdgeLength: 100,
    nodeOverlap: 20,
    refresh: 20,
    fit: true,
    padding: 30,
    randomize: false,
    componentSpacing: 100,
    nodeRepulsion: 400000,
    edgeElasticity: 100,
    nestingFactor: 5,
    gravity: 80,
    numIter: 1000,
    initialTemp: 200,
    coolingFactor: 0.95,
    minTemp: 1.0,
  },
}

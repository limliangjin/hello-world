class GMSHFileReader{
  static read(fea, meshData){
    let gmshNodes = {};
    let gmshElements = [];

    let mode = null;
    let nNodes = 0;
    let groupId = -1;
    let groupItemCount = 0;
    let groupNodes =[];
    let nbItemSaved = 0;

    let nElements = 0;
    let elementType = -1;
    let nbElementsSaved = 0;

    for (let line of meshData){
      let initMode = mode;
      if (line == '$Nodes') mode = 'nodes';
      else if (line == '$EndNodes') mode = null;
      else if (line == '$Elements') mode = 'elements';
      else if (line == '$EndElements') mode = null;
      if (initMode != mode || mode == null) continue;

      let values = line.split(' ');

      if (mode == 'nodes'){
        if (nNodes == 0) {
          nNodes = parseInt(values[1]);
        }
        else if (groupId == -1){
          groupId = parseInt(values[1]);
          groupItemCount = parseInt(values[3]);
          groupNodes = [];
          nbItemSaved = 0;
        }
        else if (groupNodes.length != groupItemCount){
          groupNodes.push(parseInt(values[0]));
        }
        else if (groupNodes.length == groupItemCount){
          gmshNodes[groupNodes[nbItemSaved]] = [parseFloat(values[0]), parseFloat(values[1]), parseFloat(values[2])];
          nbItemSaved++;
          if (nbItemSaved == groupItemCount) groupId = -1;
        }
      }
      else if (mode == 'elements'){
        if (nElements == 0) {
          nElements = parseInt(values[1]);
        }
        else if (groupId == -1){
          groupId = parseInt(values[1]);
          groupItemCount = parseInt(values[3]);
          elementType = parseInt(values[2]);
          nbElementsSaved = 0;
        }
        else if (nbElementsSaved != groupItemCount){
          let nodes = [];
          for (let n of values){
            if (n != '') nodes.push(parseInt(n));
          }
          nodes.shift();
          gmshElements.push([elementType, nodes]);
          nbElementsSaved++;
          if (nbElementsSaved == groupItemCount){
            groupId = -1;
          }
        }
      }
    }

    let nodeToNodeMap = {};
    for (const i in gmshNodes){
      let coordinates = gmshNodes[i];
      let nodeId = fea.addNode(coordinates[0], coordinates[1]);
      nodeToNodeMap[i] = nodeId;
    }

    for (let element of gmshElements){
      if (element[0] == 2){
        let nodeIds = [];
        for (let k of element[1]){
          nodeIds.push(nodeToNodeMap[k]);
        }
        fea.addElement(RealT3Element, nodeIds);
      }
      if (element[0] == 9){
        let nodeIds = [];
        for (let k of element[1]){
          nodeIds.push(nodeToNodeMap[k]);
        }
        fea.addElement(RealT6Element, nodeIds);
      }
    }
  }
}

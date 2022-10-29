'use strict'
class GlobalNodes{
  constructor(){
    this.nodes = [];
  }

  add(x, y){
    this.nodes.push([x,y]);
    return this.nodes.length - 1;
  }

  get(i){
    return this.nodes[i];
  }

  size(){
    return this.nodes.length;
  }

  totalDoFs(){
    return this.size() * 2;
  }
}

class Element{
  constructor(RealElementType, globalNodes, nodeIds, material){
    this.nodeIds = nodeIds;
    this.dofs = [];
    let points = [];
    for (let nodeId of nodeIds){
      let point = globalNodes.get(nodeId);
      points.push(point[0]);
      points.push(point[1]);
      this.dofs.push(nodeId * 2);
      this.dofs.push(nodeId * 2 + 1);
    }
    this.realElement = new RealElementType(points);
    this.material = material;
    this.Ke = null;
    this.Fint = null;
  }

  getDoFs(){
    return this.dofs;
  }

  assembleElementStiffness(){
    this.Ke = math.zeros(this.realElement.nPoints * 2, this.realElement.nPoints * 2);
    for (let i = 0; i < this.realElement.nIntPoints; ++i){
      let B = this.realElement.B[i];
      let D = this.material.getD();
      let DB = math.multiply(D, B);
      this.Ke = math.add(this.Ke, math.multiply(
        math.multiply(math.transpose(B), DB), this.realElement.weights[i]));
    }
    this.Ke = math.multiply(this.Ke, this.realElement.area);
  }

  assembleInternalForce(elementU){
    this.Fint = new Array(this.realElement.nPoints * 2).fill(0.0);
    for (let i = 0; i < this.realElement.nIntPoints; ++i){
      let B = this.realElement.B[i];
      let D = this.material.getD();
      let DB = math.multiply(D, B);
      let stress = math.multiply(DB, elementU);
      this.Fint = math.add(this.Fint, math.multiply(
        math.multiply(math.transpose(B), stress), this.realElement.weights[i]));
    }
    this.Fint = math.multiply(this.Fint, this.realElement.area);
  }

  getKe(){
    return this.Ke;
  }

  getFInt(){
    return this.Fint;
  }

  getBoundaryNodes(){
    let nodeIds = [];
    for (let boundaryNodeId of this.realElement.getLocalBoundaryNodes()){
      nodeIds.push(this.nodeIds[boundaryNodeId]);
    }
    return nodeIds;
  }
}

class DoFFilter{
  constructor(totalDoFs){
    this.nDoFs = totalDoFs;
    this.DoFsPosition = new Array(totalDoFs).fill(-1);
    this.DoFs = [];
    this.inactiveDoFs = new Set();
  }

  addInactiveDoF(dof){
    this.inactiveDoFs.add(dof);
  }

  getPosition(dof){
    return this.DoFsPosition[dof];
  }

  getDoF(i){
    return this.DoFs[i];
  }

  getNActiveDoFs(){
    return this.DoFs.length;
  }

  finalize(){
    let j = 0;
    this.DoFs = [];
    this.DoFsPosition = new Array(this.nDoFs).fill(-1);
    for (let i = 0; i < this.nDoFs; ++i){
      if (this.inactiveDoFs.has(i)){
        this.DoFsPosition[i] = -1;
      }
      else{
        this.DoFsPosition[i] = j;
        this.DoFs.push(i);
        ++j;
      }
    }
  }
}

class GlobalStiffnessMatrix{
  constructor(dofFilter){
    this.dofFilter = dofFilter;
    let size = this.dofFilter.getNActiveDoFs();
    this.K = math.zeros(size, size, 'sparse');
  }

  add(ke, dofs){
    let size = dofs.length;
    for (let i = 0; i < size; ++i){
      let pi = this.dofFilter.getPosition(dofs[i]);
      if (pi == -1) continue;
      for (let j = 0; j < size; ++j){
        let pj = this.dofFilter.getPosition(dofs[j]);
        if (pj == -1) continue;
        this.K.set([pi, pj], ke.get([i, j]) + this.K.get([pi, pj]));
      }
    }
  }

  getK(){
    return this.K;
  }
}

class GlobalFilteredVector{
  constructor(dofFilter){
    this.dofFilter = dofFilter;
    let size = this.dofFilter.getNActiveDoFs();
    this.V = new Array(size).fill(0);
  }

  add(value, dof){
    let position = this.dofFilter.getPosition(dof);
    if (position != -1){
      this.V[position] += value;
    }
  }
  getV(){
    return this.V;
  }
}


class GlobalIntPointTensor{
  constructor(nElements, nIntPointsPerElement, dim){
    this.V = new Array(nElements);
    for (let i = 0; i < nElements; ++i){
      this.V[i] = new Array(nIntPointsPerElement);
      for (let j = 0; j < nIntPointsPerElement; ++j){
        this.V[i][j] = math.zeros(dim, dim);
      }
    }
  }

  get(iElement, iIntPoint){
    return this.V[iElement][iIntPoint];
  }

  set(iElement, iIntPoint, matrix){
    this.V[iElement][iIntPoint] = matrix;
  }
}

class FEA{
  constructor(){
    this.materials = [];
    this.globalNodes = new GlobalNodes();
    this.elements = [];
    this.dofFilter = new DoFFilter();

    this.fullRhs = [];
    this.rhs = [];
    this.K = null;
    this.U = null;
    this.Fint = [];
    this.stress = null;
  }

  addNode(x, y){
    this.fullRhs.push(0.0);
    this.fullRhs.push(0.0);
    let lastNodeId = this.globalNodes.add(x, y);
    this.dofFilter = new DoFFilter(this.globalNodes.totalDoFs());
    return lastNodeId;
  }

  getNode(id){
    return this.globalNodes.get(id);
  }

  getDeformedNode(id){
    let node = [...this.globalNodes.get(id)];
    let u = this.getUOnNode(id);
    node[0] += u[0];
    node[1] += u[1];
    return node;
  }

  addMaterial(material){
    this.materials.push(material);
    return this.materials.length - 1;
  }

  addElement(ElementType, nodeIds, materialId = null){
    if (materialId != null){
      this.elements.push(new Element(ElementType, this.globalNodes, nodeIds, this.materials[materialId]));
    }
    else{
      this.elements.push(new Element(ElementType, this.globalNodes, nodeIds, null));
    }
    return this.elements.length - 1;
  }

  setMaterialOnElements(elementIds, materialId){
    for (let elementId of elementIds){
      this.elements[elementId].material = this.materials[materialId];
    }
  }

  setMaterialOnAllElements(materialId){
    for (let element of this.elements){
      element.material = this.materials[materialId];
    }
  }

  setFixity(dofs){
    for (let dof of dofs){
      this.dofFilter.addInactiveDoF(dof);
    }
  }

  addLoad(value, dof){
    this.fullRhs[dof] += value;
  }

  getElementU(element){
    let elementU = [];
    for (let iNode of element.nodeIds){
      let u = this.getUOnNode(iNode);
      elementU.push(u[0]);
      elementU.push(u[1]);
    }
    return elementU;
  }

  assemble(){
    this.dofFilter.finalize();
    this.K = new GlobalStiffnessMatrix(this.dofFilter);
    this.rhs = new GlobalFilteredVector(this.dofFilter);
    this.Fint = new GlobalFilteredVector(this.dofFilter);
    this.stress = new GlobalIntPointTensor(
      this.elements.length, this.elements[0].realElement.nIntPoints, 2);

    for (let e of this.elements){
      e.assembleElementStiffness();
      this.K.add(e.getKe(), e.getDoFs());
    }

    for (let i = 0; i < this.fullRhs.length; ++i){
      this.rhs.add(this.fullRhs[i], i);
    }
  }

  assembleInternalForce(){
    for (let e of this.elements){
      e.assembleInternalForce(this.getElementU(e));
      let i = 0;
      for (let dof of e.getDoFs()){
        this.Fint.add(e.Fint.get([i]), dof);
        ++i;
      }
    }
    print(this.Fint);
    print(this.rhs);
  }

  computeError(forceScale){
    let residual = math.subtract(math.multiply(this.rhs.V, forceScale), this.Fint.V);
    return math.norm(residual, 'inf');
  }

  iterativeSolve(forceScale, maxIteration = 10, tolerance = 1e-8){
    const csrK = CGSolve.createFromDense(this.K.getK().valueOf());
    for (let i = 0; i < maxIteration; ++i){
      print(`iteration: ${i}`);

      let rhs = [...this.rhs.getV()];
      for (let i = 0; i < rhs.length; ++i) rhs[i] *= forceScale;
      this.U = CGSolve.solveCG(csrK, this.K.getK(), rhs);

      this.assembleInternalForce();

      let error = this.computeError(forceScale);
      print(`Norm error: ${error}`);
      if (error <= tolerance){
        print('Completed');
        return;
      }
    }
  }

  solve(forceScale = 1.0){
    print(`Solving system of ${this.rhs.getV().length} dofs.`);
    this.iterativeSolve(forceScale, 10);
  }

  getUOnNode(nodeId){
    let pi = this.dofFilter.getPosition(2 * nodeId);
    let pj = this.dofFilter.getPosition(2 * nodeId + 1);
    let ux = 0;
    let uy = 0;
    if (fea.U != null){
      if (pi != -1) ux = fea.U[pi];
      if (pj != -1) uy = fea.U[pj];
    }
    return [ux, uy];
  }

  getURange(){
    let urange = [Infinity, -Infinity];
    if (this.U != null){
      for (let i = 0; i < this.U.length / 2; ++i){
        let ux = this.U[2 * i];
        let uy = this.U[2 * i + 1];
        let u = (ux**2 + uy**2) ** 0.5;
        urange[0] = min(urange[0], u);
        urange[1] = max(urange[1], u);
      }
    }
    return urange;
  }

  reset(){
    this.materials = [];
    this.globalNodes = new GlobalNodes();
    this.elements = [];
    this.dofFilter = new DoFFilter();

    this.fullRhs = [];
    this.rhs = [];
    this.K = null;
    this.U = null;
  }
}

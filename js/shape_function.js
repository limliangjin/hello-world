'use strict';

var meshData = null;
var fea = null;
var gui = null;
var solveBtn = null;

class AbstractElement{
  constructor (n){
    this.n = n;
  }

  value(i, x, y){
    return 0;
  }

  grad(i, x, y){
    return 0;
  }

  realValue(x, y, valOnNodes, dim = 1){
    let val = Array(dim).fill(0.0);
    for (let i = 0; i < this.n; ++i){
      for (let j = 0; j < dim; ++j){
        val[j] += this.value(i, x, y) * valOnNodes[i * dim + j];
      }
    }
    return val;
  }

  realGrad(x, y, valOnNodes, dim = 1){
    let val = new Array(2 * dim).fill(0.0);
    for (let i = 0; i < this.n; ++i){
      for (let j = 0; j < dim; ++j){
        let grads = this.grad(i, x, y);
        val[j] += grads[0] * valOnNodes[i * dim + j];
        val[j + dim] += grads[1] * valOnNodes[i * dim + j];
      }
    }
    return val;
  }

  computeJ(x, y, points){
    let J = this.realGrad(x, y, points, 2);
    return J;
  }

  computeInverseJ(J){
    let detJ = (J[0] * J[3] - J[1] * J[2]);
    return [detJ, [J[3], -J[1], -J[2], J[0]]];
  }
}

class T3Element extends AbstractElement{
  constructor(){
    super(3);
  }

  value(i, x, y){
    switch (i){
      case 0:
        return x;
      case 1:
        return y;
      case 2:
        return 1 - x - y;
    }
  }

  grad(i, x, y){
    switch (i){
      case 0:
        return [1, 0];
      case 1:
        return [0, 1];
      case 2:
        return [-1, -1];
    }
  }
}

class T6Element extends AbstractElement{
  constructor(){
    super(6);
  }

  value(i, x, y){
    let z = 1 - x - y;
    switch (i){
      case 0:
        return x * (2 * x - 1);
      case 1:
        return y * (2 * y - 1);
      case 2:
        return z * (2 * z - 1);
      case 3:
        return 4 * x * y;
      case 4:
        return 4 * z * y;
      case 5:
        return 4 * x * z;
    }
  }

  grad(i, x, y){
    switch (i){
      case 0:
        return [4 * x - 1, 0];
      case 1:
        return [0, 4 * y - 1];
      case 2:
        return [4 * x + 4 * y  - 3, 4 * x + 4 * y  - 3];
      case 3:
        return [4 * y, 4 * x];
      case 4:
        return [-4* y, 4 - 4 * x - 8 * y];
      case 5:
        return [4 - 8 * x - 4 * y, -4 * x];
    }
  }
}

class AbstractRealElement{
  constructor(points, intPoints, weights, elementType){
    this.points = [...points];
    this.intPoints = [...intPoints];
    this.weights = [...weights];
    this.nIntPoints = this.weights.length;
    this.nPoints = this.points.length / 2;
    this.element = elementType;
    this.J = null;
    this.inverseJ = null;
    this.B = null;
    this.area = 0;
    this.prepare();
  }

  prepare(){
    this.B = new Array(this.intPoints);
    this.inverseJ = new Array(this.intPoints);
    for (let i = 0; i < this.nIntPoints; ++i){
      this.B[i] = math.zeros(3, this.nPoints * 2);
      let B = this.B[i];
      let x = this.intPoints[2 * i];
      let y = this.intPoints[2 * i + 1];
      this.inverseJ[i] = this.element.computeInverseJ(this.element.computeJ(x, y, this.points));
      let invJ = this.inverseJ[i][1];
      let detJ = this.inverseJ[i][0];
      for (let j = 0; j < this.nPoints; ++j){
        let grads = this.element.grad(j, x, y);
        let a = (invJ[0] * grads[0] + invJ[1] * grads[1]) / detJ;
        let b = (invJ[2] * grads[0] + invJ[3] * grads[1]) / detJ;
        B.set([0, j * 2], a);
        B.set([1, j * 2 + 1], b);
        B.set([2, j * 2], b);
        B.set([2, j * 2 + 1], a);
      }
      this.area += 0.5 * detJ * this.weights[i];
    }
  }
}

class RealT3Element extends AbstractRealElement{
  constructor(points){
    super(points, [1/3, 1/3], [1.0], new T3Element());
    this.boundaryNodes = [0, 1, 2];
  }

  getLocalBoundaryNodes(){
    return this.boundaryNodes;
  }
}

class RealT6Element extends AbstractRealElement{
  constructor(points){
    super(points, [1/6, 1/6, 1/6, 2/3, 2/3, 1/6], [1/3, 1/3, 1/3], new T6Element());
    this.boundaryNodes = [0, 3, 1, 4, 2, 5];
  }

  getLocalBoundaryNodes(){
    return this.boundaryNodes;
  }
}
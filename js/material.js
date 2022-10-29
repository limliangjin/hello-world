'use strict'

class AbstractMaterial{
  constructor(){
    this.D = math.zeros(3, 3);
  }

  getD(){
    return this.D;
  }
}

class LinearElasticPlaneStressMaterial extends AbstractMaterial{
  constructor(E, v, t){
    super();
    let d = t * E / (1 - v * v);
    this.D.set([0, 0], d);
    this.D.set([1, 0], d * v);
    this.D.set([2, 0], 0);
    this.D.set([0, 1], d * v);
    this.D.set([1, 1], d);
    this.D.set([2, 1], 0);
    this.D.set([0, 2], 0);
    this.D.set([1, 2], 0);
    this.D.set([2, 2], d * (0.5 - 0.5 * v));
  }
}

class LinearElasticPlaneStrainMaterial extends AbstractMaterial{
  constructor(E, v){
    super();
    let d = E / ((1 + v) * (1 - 2 * v));
    this.D.set([0, 0], d * (1 - v));
    this.D.set([1, 0], d * v);
    this.D.set([2, 0], 0);
    this.D.set([0, 1], d * v);
    this.D.set([1, 1], d * (1 - v));
    this.D.set([2, 1], 0);
    this.D.set([0, 2], 0);
    this.D.set([1, 2], 0);
    this.D.set([2, 2], d * (0.5 - v));
  }
}

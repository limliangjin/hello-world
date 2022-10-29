'use strict';

var meshData = null;
var fea = null;
var gui = null;
var solveBtn = null;
var resetBtn = null;
var toggleNodeNumber = null;
var toggleLoad = null;
var toggleFixity = null;
var forceScale = 100;

function preload(){
  meshData = loadStrings('rectangle.msh');
}

function setupFEA(){
  fea = new FEA();

  GMSHFileReader.read(fea, meshData);
  let matId = fea.addMaterial(new LinearElasticPlaneStressMaterial(1000.0, 0.3, 1.0));
  fea.setMaterialOnAllElements(matId);

  let fixities = [];
  let iNode = 0;
  for (let node of fea.globalNodes.nodes){
    if (Math.abs(node[0] - 0.0) < 1e-8) {
      fixities.push(2 * iNode);
      fixities.push(2 * iNode + 1);
    }
    iNode++;
  }
  fea.setFixity(fixities);
  fea.addLoad(-1.0, 3);
  //fea.addLoad(-0.5, 3);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  setupFEA();

  gui = createGui();
  solveBtn = createButton("📱 solve", windowWidth/2, windowHeight*0.8, 150, 50);
  resetBtn = createButton("💀 reset", windowWidth/2, windowHeight*0.8 + 60, 150, 50);

  toggleNodeNumber = createToggle('🔢 node', windowWidth/2 - 180, windowHeight*0.8, 150, 50);
  toggleLoad = createToggle('🔽 load', windowWidth/2 - 180, windowHeight*0.8 + 60, 150, 50);
  toggleFixity = createToggle('📌 fixity', windowWidth/2 - 180, windowHeight*0.8 + 120, 150, 50);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function transform(x, y){
  const scale = 150;
  const offsetX = 200;
  const offsetY = 400;
  return [
    x * scale + offsetX,
    -y * scale + offsetY
  ];
}

function checkButtons(){
  if (solveBtn.isPressed){
    let start = window.performance.now();
    fea.assemble();
    let end = window.performance.now();
    console.log(`Assembly execution time: ${end - start} ms`);

    //start = window.performance.now();
    //fea.solve();
    //end = window.performance.now();
    //console.log(`Solve execution time: ${end - start} ms`);
    forceScale = 0;
  }

  if (resetBtn.isPressed){
    setupFEA();
  }
}

function drawNodes() {
  push();
  stroke('#000');
  fill('#000');
  let i = 0;
  for (let nodeInfo of fea.globalNodes.nodes) {
    let pos = transform(nodeInfo[0], nodeInfo[1]);
    ellipse(pos[0], pos[1], 5, 5);
  }
  pop();
}

function drawNodeNumber(){
  push();
  stroke('#aaa');
  noFill('#aaa');
  strokeWeight(1);
  textSize(20);
  let i = 0;
  for (let nodeInfo of fea.globalNodes.nodes) {
    let deformedNode = fea.getDeformedNode(i);
    let pos = transform(deformedNode[0], deformedNode[1]);
    text(`${i}`, pos[0] + 15, pos[1] + 15);
    ++i;
  }
  pop();
}

function lerpRainbow(value, range)
{
  let scaledValue = (value - range[0]) / (range[1] - range[0]);
  if (scaledValue <= 0.5) return lerpColor(color('#00f'), color('#0f0'), 2 * scaledValue);
  else return lerpColor(color('#0f0'), color('#f00'), (scaledValue - 0.5) * 2);
}

function drawSolutionNodes() {
  if (fea.U == null) return;
  let i = 0;
  let urange = fea.getURange();
  for (let nodeInfo of fea.globalNodes.nodes) {
    push();
    let U = fea.getUOnNode(i);
    let normU = (U[0] ** 2 + U[1] ** 2) ** 0.5;
    let clr = lerpRainbow(normU, urange);
    stroke(clr);
    fill(clr);
    let pos = transform(nodeInfo[0] + U[0], nodeInfo[1] + U[1]);
    ellipse(pos[0], pos[1], 7, 7);
    //text(`${i}`, pos[0] + 15, pos[1] + 15);
    pop();
    ++i;
  }
}

function drawSolutionElements() {
  if (fea.U == null) return;
  let urange = fea.getURange();
  for (let element of fea.elements) {
    let boundaryNodes = element.getBoundaryNodes();
    for (let iNode = 0; iNode < boundaryNodes.length; ++iNode) {
      let nodeId0 = boundaryNodes[iNode];
      let nodeId1 = (iNode == boundaryNodes.length - 1) ? boundaryNodes[0] : boundaryNodes[iNode + 1];
      let node0 = fea.getNode(nodeId0);
      let node1 = fea.getNode(nodeId1);

      push();
      let U0 = fea.getUOnNode(nodeId0);
      let U1 = fea.getUOnNode(nodeId1);
      let normU = (U0[0] ** 2 + U0[1] ** 2) ** 0.5;
      let clr = lerpRainbow(normU, urange);
      stroke(clr);
      fill(clr);
      let pos0 = transform(node0[0] + U0[0], node0[1] + U0[1]);
      let pos1 = transform(node1[0] + U1[0], node1[1] + U1[1]);
      line(pos0[0], pos0[1], pos1[0], pos1[1]);
      pop();

    }
  }
}

function drawElements() {
  push();
  stroke('#555');
  fill('#555');
  for (let element of fea.elements) {
    let boundaryNodes = element.getBoundaryNodes();
    for (let iNode = 0; iNode < boundaryNodes.length; ++iNode) {
      let nodeId0 = boundaryNodes[iNode];
      let nodeId1 = (iNode == boundaryNodes.length - 1) ? boundaryNodes[0] : boundaryNodes[iNode + 1];
      let node0 = fea.getNode(nodeId0);
      let node1 = fea.getNode(nodeId1);
      let pos0 = transform(node0[0], node0[1]);
      let pos1 = transform(node1[0], node1[1]);
      line(pos0[0], pos0[1], pos1[0], pos1[1]);
    }
  }
  pop();
}

function drawFixities(){
  push();
  stroke('#000');
  fill('#777');
  for (let dof of fea.dofFilter.inactiveDoFs){
    let point = fea.getNode(floor(dof / 2 ));
    let a = 18;
    let p = transform(point[0], point[1]);
    if (dof % 2 == 0) triangle(p[0], p[1], p[0] - 1.2 * a, p[1] - 0.5 * a, p[0] - 1.2 * a, p[1] + 0.5 * a);
    else triangle(p[0], p[1], p[0] - 0.5 * a, p[1] + 1.2 * a, p[0] + 0.5 * a, p[1] + 1.2 * a);
  }
  pop();
}

function drawArrow(position, fx, fy, scaling){
  push();
  stroke('#000');
  strokeWeight(2);
  fill('#aaa');
  translate(position[0], position[1]);
  rotate(Math.atan2(fy, fx));
  scale(scaling);
  const a = 20;
  beginShape();
  vertex(0, 0);
  vertex(-a, -0.25 * a);
  vertex(-a, -0.125 * a);
  vertex(-2 * a, -0.125 * a);
  vertex(-2 * a, 0.125 * a);
  vertex(-a, 0.125 * a);
  vertex(-a, 0.25 * a);
  endShape(CLOSE);
  pop();
}

function drawLoads(){
  let rhs = fea.fullRhs;
  for (let i = 0; i < rhs.length / 2; ++i){
    let f0 = rhs[2 * i];
    let f1 = rhs[2 * i + 1];
    if (f0 == 0 && f1 == 0) continue;
    let point = fea.getDeformedNode(i);
    let pos = transform(point[0], point[1]);
    drawArrow(pos, f0, -f1, 2.0);
  }
}

function drawMaxU(){
  if (fea.U == null) return;
  push();
  stroke('#777');
  fill('#777');
  let urange = fea.getURange();
  textSize(50);
  text(`|U| = ${urange[1].toFixed(3)}`, 0.5 * windowWidth - 200, 0.65 * windowHeight);
  pop();
}

function realTimeSolve(){
  if (forceScale == 100) return;
  forceScale += 20;
  fea.assemble();
  fea.solve(forceScale / 100.0);
}

function draw() {
  background('#222');
  stroke('#fff');
  fill('#fff');

  realTimeSolve();

  strokeWeight(3);
  drawGui();
  checkButtons();

  drawElements();
  drawNodes();
  drawSolutionElements();
  drawSolutionNodes();

  if (toggleFixity.val) drawFixities();
  if (toggleLoad.val) drawLoads();

  drawMaxU();

  if (toggleNodeNumber.val) drawNodeNumber();
}
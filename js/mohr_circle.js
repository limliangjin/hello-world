'use strict';

const RRef = 600.0;

var gui;
var s1;
var s2;
var tau;

var addSlider = (name, level, minVal, maxVal) => {
  let s = createSlider(
    name,
    0.5 * windowWidth - 500 / 2,
    0.8 * windowHeight + level * 50,
    400,
    40,
    minVal,
    maxVal);
  s.setStyle({
    fillBg: color("#b3cde0"),
    fillTrack: color('#005b96'),
    fillHandle: color('#011f4b'),
    strokeTrack: color('#ffffff'),
    strokeHandle: color('#ffffff'),
    strokeBg: color("#ffffff"),
  });
  return s;
}

var drawSliderValue = (s, label) =>{
  push();
  stroke('#b3cde0');
  noFill();
  textSize(30);
  text(`${label} = ${round(s.val*10)/10}`, s.x + s.w + 30, s.y + 30);
  pop();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background('#222');

  gui = createGui();
  s1 = addSlider('stress1', 0, -100, 100);
  s2 = addSlider('stress2', 1, -100, 100);
  tau = addSlider('tau', 2, -100, 100);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function updateSliderValues(){
  drawSliderValue(s1, 'σx');
  drawSliderValue(s2, 'σy');
  drawSliderValue(tau, '𝜏');
}

function computeMohr(){
  let sx = s1.val;
  let sy = s2.val;
  let t = tau.val;
  let R = ((0.5 *(sx - sy)) ** 2.0 + t ** 2.0) ** 0.5;
  let x = 0.5 * (sx + sy);
  return {R: R, x: x};
}

function transformToScreen(result, x, y){
  let R = result.R;
  let xRef = result.x;
  if (R == 0) return [0, 0];
  let scale = 0.5 * RRef / R;

  const Ox = 0.5 * windowWidth;
  const Oy = 0.4 * windowHeight;

  let scaledX = Ox + (x - xRef) * scale;
  let scaledY = Oy + y * scale;
  return [scaledX, scaledY];
}

function drawGrid(result){
  let R = result.R;
  let x = result.x;
  let minX = x - R;
  let maxX = x + R;

  if (R == 0) return;
  const grids = [1, 5, 10, 50, 100];
  let selectedGrid = 0;
  for (let grid of grids){
    selectedGrid = grid;
    if (R / grid < 8) break;
  }

  let firstTick = round(minX / selectedGrid) * selectedGrid - selectedGrid;
  let xTicks = [firstTick];
  let endTick = firstTick;
  while (endTick < maxX){
    endTick += selectedGrid;
    xTicks.push(endTick);
  }

  let yTicks = [0];
  endTick = 0;
  while (endTick < R){
    endTick += selectedGrid;
    yTicks.push(endTick);
    yTicks.push(-endTick);
  }

  push();
  noFill();
  stroke('#666');
  strokeWeight(1);
  textSize(20);
  let maxYTick = transformToScreen(result, 0, yTicks[yTicks.length - 2]);
  let minYTick = transformToScreen(result, 0, yTicks[yTicks.length - 1]);
  let maxXTick = transformToScreen(result, xTicks[xTicks.length - 1], 0);
  let minXTick = transformToScreen(result, xTicks[0], 0);

  for (let tick of xTicks){
    let transformedTick = transformToScreen(result, tick, 0);
    text(`${tick}`, transformedTick[0] - 15, maxYTick[1] + 30);
    line(transformedTick[0], minYTick[1], transformedTick[0], maxYTick[1]);
  }
  for (let tick of yTicks){
    let transformedTick = transformToScreen(result, 0, tick);
    text(`${-tick}`, maxXTick[0] + 10, transformedTick[1]);
    if (tick == 0) strokeWeight(3);
    line(minXTick[0], transformedTick[1], maxXTick[0], transformedTick[1]);
    strokeWeight(1);
  }
  pop();
}

function drawMohrCircle(){
  let result = computeMohr();
  drawGrid(result);

  const Ox = 0.5 * windowWidth;
  const Oy = 0.4 * windowHeight;
  let R = result.R;

  if (R == 0) return;
  let scaledP1 = transformToScreen(result, s1.val, tau.val);
  let scaledP2 = transformToScreen(result, s2.val, -tau.val);
  let deg = 180 * Math.atan2(tau.val*2, s1.val - s2.val) / Math.PI;

  push();
  noFill();
  stroke('#ffffff');
  strokeWeight(5);
  ellipse(Ox, Oy, 10, 10);

  stroke('#005555');
  strokeWeight(8);
  ellipse(Ox, Oy, RRef, RRef);
  strokeWeight(5);

  stroke('#ffffff');
  ellipse(scaledP1[0], scaledP1[1], 10, 10);
  ellipse(scaledP2[0], scaledP2[1], 10, 10);
  strokeWeight(1);
  line(scaledP1[0], scaledP1[1], scaledP2[0], scaledP2[1])
  textSize(35);
  text(`[${round(s1.val*10)/10}, ${round(-tau.val*10)/10}]`, scaledP1[0] + 20, scaledP1[1] + 20);
  text(`[${round(s2.val*10)/10}, ${round(tau.val*10)/10}]`, scaledP2[0] + 20, scaledP2[1] + 20);
  text(`${round((deg)*10)/10}°`, Ox + 10, Oy + 10);
  text(`${round((R - result.x)*10)/10}`, Ox - 0.5 * RRef - 50, Oy + 0.5 * RRef + 20);
  text(`${round((R + result.x)*10)/10}`, Ox + 0.5 * RRef - 25, Oy - 0.5 * RRef);

  drawingContext.setLineDash([2, 2]);
  line(Ox - 0.5 * RRef, Oy, Ox - 0.5 * RRef, Oy + 0.45 * RRef);
  line(Ox + 0.5 * RRef, Oy, Ox + 0.5 * RRef, Oy - 0.45 * RRef);
  pop();
}

function drawTitle() {
  push();
  noFill();
  stroke('#ffffff');
  strokeWeight(1);
  textSize(50);
  text(`MOHR'S CIRCLE`, 0.5 * windowWidth - 200, 0.1 * windowHeight);
  pop();
}

function draw() {
  background('#222');
  drawTitle();
  drawGui();
  updateSliderValues();
  drawMohrCircle();
}
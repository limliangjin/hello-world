'use strict';

const RRef = 600.0;

var gui;
var solid;
var air_;
var water;

var addSlider = (name, level, minVal, maxVal, defValue) => {
  let s = createSlider(
    name,
    0.5 * windowWidth - 500 / 2,
    0.8 * windowHeight + level * 55,
    400,
    50,
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
  s.val = defValue;
  return s;
}

var drawSliderValue = (s) =>{
  push();
  stroke('#b3cde0');
  noFill();
  textSize(30);
  text(`${s.val.toFixed(2)}m³`, s.x + s.w + 30, s.y + 30);
  pop();
}

var drawSliderLabel = (s) =>{
  push();
  stroke('#b3cde0');
  noFill();
  textSize(30);
  text(`${s.label}`, s.x - 100, s.y + 30);
  pop();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background('#222');

  gui = createGui();
  solid = addSlider('solid', 0, 0, 1, 0.5);
  water = addSlider('water', 1, 0, 1, 0.5);
  air_ = addSlider('air ', 2, 0, 1, 0.5);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function updateSliderValues(){
  drawSliderValue(solid);
  drawSliderValue(water);
  drawSliderValue(air_);
  drawSliderLabel(solid);
  drawSliderLabel(water);
  drawSliderLabel(air_);
}

function drawTitle() {
  push();
  noFill();
  stroke('#ffffff');
  strokeWeight(1);
  textSize(50);
  text(`SOIL PHASE STATE`, 0.5 * windowWidth - 200, 0.1 * windowHeight);
  pop();
}

function drawPercent(label, p, x, y) {
  push();
  noFill();
  stroke('#ffffff');
  strokeWeight(1);
  textSize(25);
  text(`${label} ${round(p*10) / 10}%`, x, y);
  pop();
}


function drawVoidRatioAndSaturation(x, y, Sr, e, n){
  textSize(25);
  fill('#fff');
  text(`Sr = ${Sr.toFixed(2)}%`, x, y);
  if (e > 10) text(`e  > 10`, x, y + 30);
  else text(`e  = ${e.toFixed(2)}`, x, y + 30);
  text(`n  = ${n.toFixed(2)}`, x, y + 60);
}

function drawPhaseState() {
  push();

  let s = solid.val;
  let v = air_.val;
  let w = water.val;
  let totalV = s + v + w;

  let drawHeight = 600;
  let drawWidth = 300;
  let startY0 = 0.2 * windowHeight;
  let startY = startY0;
  let startX = 0.45 * windowWidth - drawWidth / 2;

  let sL = s * drawHeight / totalV;
  let vL = v * drawHeight / totalV;
  let wL = w * drawHeight / totalV;
  let percentageY = [-1, -1, -1];
  stroke('#ffffff');
  if (v > 0.0001){
    fill('#000')
    rect(startX, startY, drawWidth, vL);
    percentageY[0] = startY + 0.5 * vL + 12.5;
    startY += vL;
  }
  if (w > 0.0001){
    fill('#2986cc')
    rect(startX, startY, drawWidth, wL);
    percentageY[1] = startY + 0.5 * wL + 12.5;
    startY += wL;
  }
  if (s > 0.0001){
    fill('#786b5e')
    rect(startX, startY, drawWidth, sL);
    percentageY[2] = startY + 0.5 * sL + 12.5;
    startY += sL;
  }
  if (percentageY[1] > 0) {
    if (percentageY[1] - percentageY[0] < 25) percentageY[1] = percentageY[1] = percentageY[0] + 25;
    if (percentageY[2] > 0 && (percentageY[2] - percentageY[1] < 25)) {
      percentageY[1] = percentageY[2] - 25;
    }
  }
  if (percentageY[0] > 0) drawPercent('air  ', v/totalV*100, startX + drawWidth + 50, percentageY[0]);
  if (percentageY[1] > 0) drawPercent('water', w/totalV*100, startX + drawWidth + 50, percentageY[1]);
  if (percentageY[2] > 0) drawPercent('solid', s/totalV*100, startX + drawWidth + 50, percentageY[2]);
  let Sr = 0;
  if (w > 0) Sr = w / (v + w) * 100;
  let e = (v + w) / (s + 1e-8);
  let n = e / (1 + e);
  drawVoidRatioAndSaturation(startX + 100, startY0 + drawHeight + 50, Sr, e, n);
  pop();
}


function draw() {
  textFont('Courier New')
  background('#222');
  drawTitle();
  drawGui();
  updateSliderValues();
  drawPhaseState();
}
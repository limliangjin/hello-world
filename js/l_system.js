'use strict';

var options = {
  drawLength: 2,
  drawFrequency: 25,
  turnAngle: 25,
  state: {
    x: 0,
    y: 0,
    currentAngle: 0
  },
  savedState: [],
  initial: '',
  rules: [],
  nIterations: 8,
  generatedString: '',
  currentCharId: 0,
  canvas: null,
  ruleFunction: null,
  lRate: 1000.0,
  iteration: 0,
  maxIteration: 3
}

// interpret an L-system
function lindenmayer(s) {
  let outputstring = ''; // start a blank output string

  // iterate through rules looking for symbol matches:
  for (let i = 0; i < s.length; i++) {
    let ismatch = 0; // by default, no match
    for (let j = 0; j < options.rules.length; j++) {
      if (s[i] == options.rules[j][0])  {
        outputstring += options.rules[j][1]; // write substitution
        ismatch = 1; // we have a match, so don't copy over symbol
        break; // get outta this for() loop
      }
    }
    // if nothing matches, just copy the symbol over.
    if (ismatch == 0) outputstring+= s[i];
  }
  return outputstring; // send out the modified string
}

function generateString(){
  for (let i = 0; i < options.nIterations[options.iteration]; ++i){
    options.generatedString = lindenmayer(options.generatedString);
  }
}

// TREE Rule --------------------------------------------------------
function setTreeRule(){
  options.drawLength = [20, 10, 5, 3];
  options.nIterations = [4, 5, 6, 7];
  options.turnAngle = 25;
  options.initial = 'X';
  options.rules[0] = ['X', 'F+[[X]-X]-F[-FX]+X'];
  options.rules[1] = ['F', 'FF'];
  options.currentCharId = 0;
  options.generatedString = options.initial;

  generateString();

  options.savedState = [];
  options.state.x = canvas.width / 2;
  options.state.y = 3 * canvas.height / 4;
  options.state.currentAngle = -90;
  options.title = 'Tree';
}

// DRAGON Rule --------------------------------------------------------
function setDragonRule(){
  options.nIterations = [6, 8, 10, 12];
  options.turnAngle = 90;
  options.drawLength = [64, 32, 16, 8];
  options.initial = 'F';
  options.rules[0] = ['F', 'F+G'];
  options.rules[1] = ['G', 'F-G'];
  options.currentCharId = 0;
  options.generatedString = options.initial;

  generateString();

  options.savedState = [];
  options.state.x = canvas.width / 2;
  options.state.y = canvas.height / 3;
  options.state.currentAngle = -90;
  options.title = 'Dragon';
}

// Sierpinski Triangle Rule --------------------------------------------------------
function setSierpinskiTriangleRule(){
  options.nIterations = [4, 5, 6, 7];
  options.turnAngle = 60;
  options.drawLength = [24, 12, 6, 3];
  options.initial = 'F-G-G';
  options.rules[0] = ['F', 'G-F-G'];
  options.rules[1] = ['G', 'F+G+F'];
  options.currentCharId = 0;
  options.generatedString = options.initial;

  generateString();

  options.savedState = [];
  options.state.x = canvas.width / 3;
  options.state.y = 3 * canvas.height / 4;
  options.state.currentAngle = 0;
  options.state.currentAngle = 0;
  options.title = 'Sierpinski Triangle';
}

// KochKnot Rule --------------------------------------------------------
function setKochIslandRule(){
  options.nIterations = [1, 2, 3, 4];
  options.turnAngle = 90;
  options.drawLength = [80, 40, 20, 10];
  options.initial = 'F-F-F-F';
  options.rules[0] = ['F', 'FF-F+F-F-FF'];
  options.currentCharId = 0;
  options.generatedString = options.initial;

  generateString();

  options.savedState = [];
  options.state.x = canvas.width / 2;
  options.state.y = 2 * canvas.height / 3;
  options.state.currentAngle = 0;
  options.drawFrequency = 20;
  options.title = 'Koch Island';
}

// Gosper Rule --------------------------------------------------------
function setGosperRule(){
  options.nIterations = [2, 3, 4, 5];
  options.turnAngle = 60;
  options.drawLength = [40, 20, 10, 4];
  options.initial = 'F';
  options.rules[0] = ['F', 'F+G++G-F--FF-G+'];
  options.rules[1] = ['G', '-F+GG++G+F--F-G'];
  options.currentCharId = 0;
  options.generatedString = options.initial;

  generateString();

  options.savedState = [];
  options.state.x = canvas.width / 2;
  options.state.y = canvas.height / 3;
  options.state.currentAngle = 0;
  options.state.currentAngle = -25;
  options.title = 'Gosper';
}

// Binary fractal Rule --------------------------------------------------------
function setBinaryFractalRule(){
  options.nIterations = [5, 6, 7, 8];
  options.turnAngle = 45;
  options.drawLength = [24, 12, 6, 3];
  options.initial = 'G';
  options.rules[0] = ['F', 'FF'];
  options.rules[1] = ['G', 'F[+G]-G'];
  options.currentCharId = 0;
  options.generatedString = options.initial;

  generateString();

  options.savedState = [];
  options.state.x = canvas.width / 2;
  options.state.y = 2 * canvas.height / 3;
  options.state.currentAngle = 0;
  options.drawFrequency = 20;
  options.state.currentAngle = -90;
  options.title = 'Binary Fractal';
  options.lRate = 100;
}

//Cantor Set Rule --------------------------------------------------------
function setCantorSetRule(){
  options.nIterations = [2, 3, 4, 5];
  options.turnAngle = 90;
  options.drawLength = [24, 12, 6, 3];
  options.initial = 'F';
  options.rules[0] = ['F', 'F+F-F-F+F'];
  options.currentCharId = 0;
  options.generatedString = options.initial;

  generateString();

  options.savedState = [];
  options.state.x = canvas.width / 2;
  options.state.y = 3 * canvas.height / 4;
  options.state.currentAngle = 0;
  options.drawFrequency = 20;
  options.state.currentAngle = -90;
  options.title = 'Cantor';
  options.lRate = 100;
}

//Taurus Rule --------------------------------------------------------
function setTaurusRule(){
  options.nIterations = [6, 8, 10, 12];
  options.turnAngle = 90;
  options.drawLength = [40, 20, 10, 5];
  options.initial = 'F';
  options.rules[0] = ['X', 'F+F-'];
  options.rules[1] = ['F', 'X+X-'];
  options.currentCharId = 0;
  options.generatedString = options.initial;

  generateString();

  options.savedState = [];
  options.state.x = 0.45 * canvas.width;
  options.state.y = 1 * canvas.height / 2;
  options.state.currentAngle = 0;
  options.drawFrequency = 20;
  options.state.currentAngle = -180;
  options.title = 'Taurus';
}

//Quadratic Gosper Rule --------------------------------------------------------
function setQuadraticGosperRule(){
  options.maxIteration = 2;
  options.nIterations = [1, 2, 3];
  options.turnAngle = 90;
  options.drawLength = [16, 8, 4];
  options.initial = '-YF';
  options.rules[0] = ['X', 'XFX-YF-YF+FX+FX-YF-YFFX+YF+FXFXYF-FX+YF+FXFX+YF-FXYF-YF-FX+FX+YFYF-'];
  options.rules[1] = ['Y', '+FXFX-YF-YF+FX+FXYF+FX-YFYF-FX-YF+FXYFYF-FX-YFFX+FX+YF-YF-FX+FX+YFY'];
  options.currentCharId = 0;
  options.generatedString = options.initial;

  generateString();

  options.savedState = [];
  options.state.x = 0.65 * canvas.width;
  options.state.y = 1 * canvas.height / 3;
  options.state.currentAngle = 0;
  options.drawFrequency = 100;
  options.state.currentAngle = -180;
  options.title = 'Quadratic Gosper';
  options.lRate = 100;
}

//Square Sierpinski Rule --------------------------------------------------------
function setSquareSierpinskiRule(){
  options.maxIteration = 3;
  options.nIterations = [2, 3, 4, 5];
  options.turnAngle = 90;
  options.drawLength = [40, 20, 10, 5];
  options.initial = 'F+XF+F+XF';
  options.rules[0] = ['X', 'XF-F+F-XF+F+XF-F+F-X'];
  //options.rules[1] = ['Y', '+FXFX-YF-YF+FX+FXYF+FX-YFYF-FX-YF+FXYFYF-FX-YFFX+FX+YF-YF-FX+FX+YFY'];
  options.currentCharId = 0;
  options.generatedString = options.initial;

  generateString();

  options.savedState = [];
  options.state.x = 0.5 * canvas.width;
  options.state.y = 2 * canvas.height / 3;
  options.state.currentAngle = 0;
  options.drawFrequency = 100;
  options.state.currentAngle = -180;
  options.title = 'Square Sierpinski';
  options.lRate = 150;
}

//Crystal Rule --------------------------------------------------------
function setCrystalRule(){
  options.maxIteration = 3;
  options.nIterations = [2, 3, 4, 5];
  options.turnAngle = 90;
  options.drawLength = [16, 8, 4, 2];
  options.initial = 'F+F+F+F';
  options.rules[0] = ['F', 'FF+F++F+F'];
  //options.rules[1] = ['Y', '+FXFX-YF-YF+FX+FXYF+FX-YFYF-FX-YF+FXYFYF-FX-YFFX+FX+YF-YF-FX+FX+YFY'];
  options.currentCharId = 0;
  options.generatedString = options.initial;

  generateString();

  options.savedState = [];
  options.state.x = 0.6 * canvas.width;
  options.state.y = 2 * canvas.height / 3;
  options.state.currentAngle = 0;
  options.drawFrequency = 100;
  options.state.currentAngle = -180;
  options.title = 'Crystal';
  options.lRate = 150;
}

//Pentaplexity Rule --------------------------------------------------------
function setPentaplexityRule(){
  options.maxIteration = 3;
  options.nIterations = [1, 2, 3, 4];
  options.turnAngle = 36;
  options.drawLength = [64, 32, 16, 8];
  options.initial = 'F++F++F++F++F';
  options.rules[0] = ['F', 'F++F++F|F-F++F'];
  //options.rules[1] = ['Y', '+FXFX-YF-YF+FX+FXYF+FX-YFYF-FX-YF+FXYFYF-FX-YFFX+FX+YF-YF-FX+FX+YFY'];
  options.currentCharId = 0;
  options.generatedString = options.initial;

  generateString();

  options.savedState = [];
  options.state.x = 0.6 * canvas.width;
  options.state.y = 2 * canvas.height / 3;
  options.state.currentAngle = 0;
  options.drawFrequency = 100;
  options.state.currentAngle = -180;
  options.title = 'Pentaplexity';
  options.lRate = 150;
}

var RULES = [
  setKochIslandRule,
  setGosperRule,
  setSierpinskiTriangleRule,
  setDragonRule,
  setTreeRule,
  setBinaryFractalRule,
  setCantorSetRule,
  setTaurusRule,
  setQuadraticGosperRule,
  setSquareSierpinskiRule,
  setCrystalRule,
  setPentaplexityRule
];

var currentRuleId = 0;

var initialize = ()=> {
  changeRule();
  background('#222');
  drawTitle();
  drawSubTitle();
}

var gui = null;
var regenButton = null;
var iterationButton = null;


function increaseIteration(){
  options.iteration++;
  if (options.iteration > options.maxIteration) options.iteration = 0;
  options.ruleFunction = RULES[currentRuleId];
  options.ruleFunction();
  background('#222');
  drawTitle();
  drawSubTitle();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  //pixelDensity(1);
  background('#222');
  stroke(150, 150, 0, 255);
  strokeWeight(2);
  noFill();

  initialize();
  gui = createGui();
  regenButton = createButton('⟳', windowWidth / 2 - 40, 0.9 * windowHeight, 80, 80);
  regenButton.setStyle({
    fillBg: color("#FFFFFF"),
    rounding: 10,
    textSize: 40
  });
  regenButton.onPress = initialize;

  iterationButton = createButton('+', windowWidth / 2 - 120, 0.9 * windowHeight, 80, 80);
  iterationButton.setStyle({
    fillBg: color("#FFFFFF"),
    rounding: 10,
    textSize: 40
  });
  iterationButton.onPress = increaseIteration;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

var ca = 0;

function draw() {
  drawGui();
  let drawFrequency = options.generatedString.length / 100;
  for (let i = 0; i < drawFrequency; ++i) {
    // draw the current character in the string:
    drawIt(options.generatedString[options.currentCharId]);
    // increment the point for where we're reading the string.
    // wrap around at the end.
    options.currentCharId++;
    let H = 255;
    let S = 0;
    let L = 25 * Math.sin(ca / options.lRate) + 50;
    let c = color(`hsla(${H}, ${S}%, ${L}%, 1.0)`);
    stroke(c);
    ca++;
    if (options.currentCharId > options.generatedString.length-1) {
      drawFrequency = 0;
    }
  }
}

// this is a custom function that draws turtle commands
function drawIt(k) {

  if (k=='F' || k=='G') { // draw forward
    // polar to cartesian based on step and currentangle:
    let drawLength = options.drawLength[options.iteration];
    let x1 = options.state.x + drawLength * cos(radians(options.state.currentAngle));
    let y1 = options.state.y + drawLength * sin(radians(options.state.currentAngle));
    line(options.state.x, options.state.y, x1, y1); // connect the old and the new

    // update the turtle's position:
    options.state.x = x1;
    options.state.y = y1;
  } else if (k == '+') {
    options.state.currentAngle += options.turnAngle; // turn left
  } else if (k == '-') {
    options.state.currentAngle -= options.turnAngle; // turn right
  } else if (k == ']') {
    options.state = options.savedState.pop();
  } else if (k == '[') {
    options.savedState.push({...options.state});
  } else if (k == '|') {
    options.state.currentAngle += 180; // turn left
  }
}

function changeRule(){
  currentRuleId++;
  if (currentRuleId == RULES.length) currentRuleId = 0;
  options.ruleFunction = RULES[currentRuleId]
  options.ruleFunction();
}

function drawTitle(){
  push();
  textAlign(CENTER, CENTER);
  noFill();
  stroke('#FFF');
  strokeWeight(2);
  textSize(50);
  text("L-System", windowWidth / 2, windowHeight / 12);
  pop();
}

function drawSubTitle(){
  push();
  textAlign(CENTER, CENTER);
  noFill();
  stroke('#FFF');
  strokeWeight(1);
  textSize(30);
  text(options.title, windowWidth / 2, windowHeight / 8);
  pop();
}
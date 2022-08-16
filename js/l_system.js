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
  ruleFunction: null
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

// TREE Rule --------------------------------------------------------
function setTreeRule(){
  options.drawLength = 5;
  options.nIterations = 6;
  options.turnAngle = 25;
  options.initial = 'X';
  options.rules[0] = ['X', 'F+[[X]-X]-F[-FX]+X'];
  options.rules[1] = ['F', 'FF'];
  options.currentCharId = 0;
  options.generatedString = options.initial;

  for (let i = 0; i < options.nIterations; ++i){
    options.generatedString = lindenmayer(options.generatedString);
  }

  options.savedState = [];
  options.state.x = canvas.width / 2;
  options.state.y = 3 * canvas.height / 4;
  options.state.currentAngle = -90;
}

// DRAGON Rule --------------------------------------------------------
function setDragonRule(){
  options.nIterations = 12;
  options.turnAngle = 90;
  options.drawLength = 8;
  options.initial = 'F';
  options.rules[0] = ['F', 'F+G'];
  options.rules[1] = ['G', 'F-G'];
  options.currentCharId = 0;
  options.generatedString = options.initial;

  for (let i = 0; i < options.nIterations; ++i){
    options.generatedString = lindenmayer(options.generatedString);
  }

  options.savedState = [];
  options.state.x = canvas.width / 2;
  options.state.y = canvas.height / 3;
  options.state.currentAngle = -90;
}

// Sierpinski Triangle Rule --------------------------------------------------------
function setSierpinskiTriangleRule(){
  options.nIterations = 7;
  options.turnAngle = 60;
  options.drawLength = 5;
  options.initial = 'F-G-G';
  options.rules[0] = ['F', 'G-F-G'];
  options.rules[1] = ['G', 'F+G+F'];
  options.currentCharId = 0;
  options.generatedString = options.initial;

  for (let i = 0; i < options.nIterations; ++i){
    options.generatedString = lindenmayer(options.generatedString);
  }

  options.savedState = [];
  options.state.x = canvas.width / 3;
  options.state.y = 3 * canvas.height / 4;
  options.state.currentAngle = 0;
  options.drawFrequency = 10;
  options.state.currentAngle = 0;
}

// KochKnot Rule --------------------------------------------------------
function setKochIslandRule(){
  options.nIterations = 4;
  options.turnAngle = 90;
  options.drawLength = 10;
  options.initial = 'F-F-F-F';
  options.rules[0] = ['F', 'FF-F+F-F-FF'];
  options.currentCharId = 0;
  options.generatedString = options.initial;

  for (let i = 0; i < options.nIterations; ++i){
    options.generatedString = lindenmayer(options.generatedString);
  }

  options.savedState = [];
  options.state.x = canvas.width / 2;
  options.state.y = 2 * canvas.height / 3;
  options.state.currentAngle = 0;
  options.drawFrequency = 20;
}

// Gosper Rule --------------------------------------------------------
function setGosperRule(){
  options.nIterations = 4;
  options.turnAngle = 60;
  options.drawLength = 10;
  options.initial = 'F';
  options.rules[0] = ['F', 'F+G++G-F--FF-G+'];
  options.rules[1] = ['G', '-F+GG++G+F--F-G'];
  options.currentCharId = 0;
  options.generatedString = options.initial;

  for (let i = 0; i < options.nIterations; ++i){
    options.generatedString = lindenmayer(options.generatedString);
  }

  options.savedState = [];
  options.state.x = canvas.width / 2;
  options.state.y = canvas.height / 3;
  options.state.currentAngle = 0;
  options.drawFrequency = 20;
  options.state.currentAngle = -25;
}

// Binary fractal Rule --------------------------------------------------------
function setBinaryFractalRule(){
  options.nIterations = 8;
  options.turnAngle = 45;
  options.drawLength = 3;
  options.initial = 'G';
  options.rules[0] = ['F', 'FF'];
  options.rules[1] = ['G', 'F[+G]-G'];
  options.currentCharId = 0;
  options.generatedString = options.initial;

  for (let i = 0; i < options.nIterations; ++i){
    options.generatedString = lindenmayer(options.generatedString);
  }

  options.savedState = [];
  options.state.x = canvas.width / 2;
  options.state.y = 2 * canvas.height / 3;
  options.state.currentAngle = 0;
  options.drawFrequency = 20;
  options.state.currentAngle = -90;
}

//Cantor Set Rule --------------------------------------------------------
function setCantorSetRule(){
  options.nIterations = 4;
  options.turnAngle = 90;
  options.drawLength = 10;
  options.initial = 'F';
  options.rules[0] = ['F', 'F+F-F-F+F'];
  options.currentCharId = 0;
  options.generatedString = options.initial;

  for (let i = 0; i < options.nIterations; ++i){
    options.generatedString = lindenmayer(options.generatedString);
  }

  options.savedState = [];
  options.state.x = canvas.width / 2;
  options.state.y = 3 * canvas.height / 4;
  options.state.currentAngle = 0;
  options.drawFrequency = 20;
  options.state.currentAngle = -90;
}

var RULES = [
  setGosperRule,
  setKochIslandRule,
  setSierpinskiTriangleRule,
  setDragonRule,
  setTreeRule,
  setBinaryFractalRule,
  setCantorSetRule
];

var currentRuleId = 0;

var initialize = ()=> {
  changeRule();
  background('#222');
  drawTitle();
}

var eventHandler = null
var regenButton = null

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background('#222');
  stroke(150, 150, 0, 255);
  strokeWeight(2);
  noFill();

  initialize();
  eventHandler = new MouseEventHandler();
  regenButton = new P5Button(
    eventHandler,
    windowWidth / 2, 0.9 * windowHeight,
    80, 80,
    "⟳",
    initialize);
  regenButton.draw();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

var ca = 0;

function draw() {
  regenButton.draw();
  for (let i = 0; i < options.drawFrequency; ++i) {
    // draw the current character in the string:
    drawIt(options.generatedString[options.currentCharId]);
    // increment the point for where we're reading the string.
    // wrap around at the end.
    options.currentCharId++;
    let cb = round((ca)%1020 / 4)
    let c = color(`hsla(${cb}, 100%, 50%, 0.5)`)
    stroke(c);
    ca++;
    if (options.currentCharId > options.generatedString.length-1) {
      options.drawFrequency = 0;
    }
  }
}

// this is a custom function that draws turtle commands
function drawIt(k) {

  if (k=='F' || k=='G') { // draw forward
    // polar to cartesian based on step and currentangle:
    let x1 = options.state.x + options.drawLength * cos(radians(options.state.currentAngle));
    let y1 = options.state.y + options.drawLength * sin(radians(options.state.currentAngle));
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
  textSize(80);
  text("L-System", windowWidth / 2, 100);
  pop();
}

function mousePressed() {
  eventHandler.checkOnClick();
}
"use strict"

// Global settings and variables
const FS = 100;
const MAX_DRAW_POINTS = 2000;
const DEFAULT_RADIUS = 50;
const N_CIRCLES = 3;
const CIRCLE_TOOL = "Circle Tool ";
const ROTATION_SPEED = "Rotation Speed ";
const DRAW_CIRCLES = "Draw Circle Tools";
const SETTING_TITLE = "Spirograph";
const RESET_DRAWING = "Reset";
const SHOW_THIRD_CIRCLE = "Show Third Circle"

var spirograph = null;
var settings = null;
var eventHandler = null;
var regenButton = null;
var nCircles = 2;

const isMobile = navigator.userAgentData.mobile;

// A class to compute a circular movement
class CircleTool{
  constructor(index){
    this.index = index;
    this.L = 0;
    this.F = 0;
    this.x = 0;
    this.y = 0;
    this.Ox = 0;
    this.Oy = 0;
    this.changed = true;
  }

  compute(t, Ox, Oy, F0){
    let L = settings.getValue(`${CIRCLE_TOOL}${this.index}`) * DEFAULT_RADIUS;
    let F = settings.getValue(`${ROTATION_SPEED}${this.index}`) * F0;
    this.changed = (L != this.L || F != this.F);
    this.L = L;
    this.F = F;
    this.Ox = Ox;
    this.Oy = Oy;
    let w = (-1)**this.index * this.F / FS;
    this.x = this.L * Math.sin(w * t) + this.Ox;
    this.y = this.L * Math.cos(w * t) + this.Oy;
  }

  draw(){
    push();
    // Draw the circle
    stroke('#666');
    strokeWeight(2);
    noFill();
    ellipse(this.Ox, this.Oy, 2 * this.L);
    line(this.Ox, this.Oy, this.x, this.y);
    // Draw the anchor point
    fill('#666');
    if (this.index == 0) ellipse(this.Ox, this.Oy, 10);
    ellipse(this.x, this.y, 10);
    pop();
  }
}

// Main spirograph class, contains a collection of CircleTools,
// and is responsible in computing the movement path of the circles.
class SpiroGraph{
  constructor(nCircles){
    this.nCircles = nCircles;
    this.circleTools = [];
    for (let i = 0; i < nCircles; ++i){
      this.circleTools.push(new CircleTool(i));
    }

    this.t = 0; // global tick
    this.xF = 0;
    this.yF = 0;
    this.drawPoints = [];
  }

  compute(){
    let currentX = windowWidth / 2;
    let currentY = windowHeight / 2;
    let F0 = 1;
    for (let i = 0; i < this.nCircles; ++i){
      this.circleTools[i].compute(this.t, currentX, currentY, F0);
      currentX = this.circleTools[i].x;
      currentY = this.circleTools[i].y;
      F0 = this.circleTools[i].F;
    }

    this.xF = currentX;
    this.yF = currentY;
    this.drawPoints.push([this.xF, this.yF]);
    if (this.drawPoints.length > MAX_DRAW_POINTS) this.drawPoints.shift();
    this.t++;
  }

  draw(){
    push();
    stroke('#07C');
    strokeWeight(3);  
    beginShape();
    for (point of this.drawPoints){
      curveVertex(point[0], point[1]);
    }
    endShape();

    let drawCircles = settings.getValue(DRAW_CIRCLES);
    if (drawCircles){
      for (let i = 0; i < this.nCircles; ++i){
        this.circleTools[i].draw();
      }
    }
    ellipse(this.xF, this.yF, 10);
  }

  reset(){
    this.drawPoints = [];
    this.t = 0;
  }

  regenerateRandom(){
    settings
    for (let i = 0; i < N_CIRCLES; ++i){
      let circleSize = round(random(1, 5));
      let speed = random(1, 10);
      settings
      .setValue(`${CIRCLE_TOOL}${i}`, circleSize)
      .setValue(`${ROTATION_SPEED}${i}`, speed);
    }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  spirograph = new SpiroGraph(N_CIRCLES);
  eventHandler = new MouseEventHandler();
  regenButton = new P5Button(
    eventHandler,
    windowWidth / 2, 0.9 * windowHeight,
    80, 80,
    "⟳",
    spirograph.regenerateRandom);

  settings = QuickSettings.create(10, 10, SETTING_TITLE);
  settings.setCollapsible(true);

  for (let i = 0; i < N_CIRCLES; ++i){
    settings
    .addRange(`${CIRCLE_TOOL}${i}`, 1, 5, 2, 1, function(value) {spirograph.reset();})
    .addRange(`${ROTATION_SPEED}${i}`, 1.0, 10.0, 1.0, 0.1, function(value) {spirograph.reset();});
  }

  settings.addBoolean(SHOW_THIRD_CIRCLE, false,
    function(value){
      if (value) {
        spirograph.nCircles = 3;
        settings.showControl(`${CIRCLE_TOOL}2`);
        settings.showControl(`${ROTATION_SPEED}2`);
      }
      else{
        spirograph.nCircles = 2;
        settings.hideControl(`${CIRCLE_TOOL}2`);
        settings.hideControl(`${ROTATION_SPEED}2`);
      }
      spirograph.reset();
  });
  settings.setValue(SHOW_THIRD_CIRCLE, false);

  settings.addButton(RESET_DRAWING, function(value){spirograph.reset();});
  settings.addBoolean(DRAW_CIRCLES, true, function(value) {});
  if (isMobile) settings.hide();
}

function drawTitle(){
  push();
  textAlign(CENTER, CENTER);
  stroke('#FFF');
  strokeWeight(1);
  textSize(80);
  text("Spirograph", windowWidth / 2, 100);
  pop();
}

function drawUIs(){
  regenButton.draw();
}

function draw() {
  background('#222');
  noFill();
  drawTitle();
  drawUIs();

  spirograph.compute();
  spirograph.draw();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  spirograph.reset();
}

function mousePressed() {
  eventHandler.checkOnClick();
}
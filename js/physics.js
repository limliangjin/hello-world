"use strict"

var settings = null;

var world = null;
var box1 = null;
var box2 = null;
var box3 = null;
var box4 = null;
var ground = null;

var GlobalScale = 100.0;
const MOUSE_OVER = 1;
const MOUSE_OUT = 2;
const MOUSE_PRESSED = 3;

class AbstractBody {
  constructor(world)
  {
    this.world = world;
    this.body = null;
    this.mouseEventType = MOUSE_OVER;
  }

  draw()
  {
    if (this.body == null) return;
    push();
    let position = this.body.getPosition();
    translate(position.x * GlobalScale, position.y * GlobalScale);
    rotate(this.body.getAngle());
    rectMode(CENTER);
    if (this.mouseContactType == MOUSE_OVER) fill('#F00');
    else if (this.mouseContactType == MOUSE_PRESSED) fill('#0F0');
    rect(0, 0, this.w * GlobalScale, this.h * GlobalScale);
    fill('#FFF');
    ellipse(0, 0, 5, 5);
    pop();
  }

  setContactType(){
    this.mouseContactType = MOUSE_OUT;
    if (this.body == null) return;

    for (let f = this.body.getFixtureList(); f; f = f.getNext()) {
      let shape = f.getShape();
      let transform = planck.Transform.identity();
      let position = this.body.getPosition();
      let point = planck.Vec2(position.x - mouseX/GlobalScale, position.y - mouseY/GlobalScale);
      let hit = shape.testPoint(transform, point);
      if (hit){
        this.mouseContactType = thisWorld.mouseEventType;
        return;
      }
    }
  }

  doUpdate(){}

  update(){
    this.setContactType();
    this.doUpdate();
    this.draw();
  }
}

class StaticBody extends AbstractBody {
  constructor(world, x, y)
  {
    super(world);
    this.body = world.createBody({
      position: planck.Vec2(x, y)
    });
  }
}

class StaticBoxBody extends StaticBody {
  constructor(world, x, y, w, h)
  {
    super(world, x, y);
    this.w = w;
    this.h = h;
    let box = planck.Box(w * 0.5, h * 0.5);
    this.body.createFixture(box, 0.0);
  }
}

class DynamicBody extends AbstractBody {
  constructor(world, x, y)
  {
    super(world);
    this.body = world.createBody({
      type: "dynamic",
      position: planck.Vec2(x, y),
      linearDamping: 5.0
    });
  }
}

class DynamicBoxBody extends DynamicBody {
  constructor(world, x, y, w, h)
  {
    super(world, x, y);
    this.w = w;
    this.h = h;
    let dynamicBox = planck.Box(w * 0.5, h * 0.5);
    let fixtureDef = {
      shape: dynamicBox,
      density: 200.0,
      friction: 0.2
    }
    this.body.createFixture(fixtureDef);
  }

  doUpdate(){
    if (this.mouseContactType == MOUSE_PRESSED){
      this.body.setPosition(planck.Vec2(mouseX / GlobalScale, mouseY / GlobalScale));
    }
  }
}

class AbstractJoint{
  constructor(world){
    this.world = world;
    this.joint = null;
  }

  draw(){};

  update(){
    this.draw();
  }
}

class DistanceJoint extends AbstractJoint{
  constructor(world, body1, body2, frequencyHz, damping){
    super(world);
    this.joint = this.world.createJoint(planck.DistanceJoint({
      collideConnected: true,
      frequencyHz: frequencyHz,
      dampingRatio: damping,
    }, body1, body2, body1.getPosition(), body2.getPosition()));
  }

  draw(){
    push();
    stroke('#000');
    strokeWeight(3);
    line(this.joint.getAnchorA().x * GlobalScale, this.joint.getAnchorA().y * GlobalScale,
      this.joint.getAnchorB().x * GlobalScale, this.joint.getAnchorB().y * GlobalScale)
    pop();
  };
}

class AbstractWorld{
  constructor(){
    this.world = null;
  }
}

class World extends AbstractWorld{
  constructor(){
    super();
    this.world = planck.World({gravity: planck.Vec2(0.0, 0.0)});
    this.bodies = {}
    this.joints = {}
  }

  setGravity(x, y){
    this.world.setGravity(planck.Vec2(x, y));
  }

  addBody(name, body){
    this.bodies[name] = body;
  }

  addJoint(name, bodyName1, bodyName2, frequencyHz, damping){
    let body1 = this.bodies[bodyName1].body;
    let body2 = this.bodies[bodyName2].body;
    this.joints[name] = new DistanceJoint(this.world, body1, body2, frequencyHz, damping);
  }

  frameUpdate(){
    for (let k in this.joints){
      this.joints[k].update();
    }
    for (let k in this.bodies){
      this.bodies[k].update();
    }
  }
}

var thisWorld = null;

function setupBeam() {
  thisWorld.addBody('box00', new StaticBoxBody(thisWorld.world, 0, 3, 0.5, 0.5));
  thisWorld.addBody('box01', new StaticBoxBody(thisWorld.world, 0, 4, 0.5, 0.5));
  for (let i = 1; i <= 20; ++i){
    for (let j = 0; j < 2; ++j){
      let boxName = `box${i}${j}`;
      thisWorld.addBody(boxName, new DynamicBoxBody(thisWorld.world, i, j + 3, 0.5, 0.5));
    }
  }

  let K = 1000.0;
  let C = 5000.0;
  // Vertical joints
  for (let i = 1; i <= 20; ++i){
    for (let j = 0; j < 2; ++j){
      let box1Name = `box${i}0`;
      let box2Name = `box${i}1`;
      thisWorld.addJoint(`joint_${box1Name}${box2Name}`, box1Name, box2Name, K, C);
    }
  }

  // horizontal joints
  for (let i = 0; i < 20; ++i){
    for (let j = 0; j < 2; ++j){
      let box1Name = `box${i}${j}`;
      let box2Name = `box${i + 1}${j}`;
      thisWorld.addJoint(`joint_${box1Name}${box2Name}`, box1Name, box2Name, K, C);
    }
    let box1Name = `box${i}0`;
    let box2Name = `box${i + 1}1`;
    thisWorld.addJoint(`joint_${box1Name}${box2Name}`, box1Name, box2Name, K, C);
    box1Name = `box${i + 1}0`;
    box2Name = `box${i}1`;
    thisWorld.addJoint(`joint_${box1Name}${box2Name}`, box1Name, box2Name, K, C);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  thisWorld = new World();
  thisWorld.setGravity(0.0, 20.0);

  setupBeam();
}

function draw() {

  if (thisWorld == null) return;

  background('#222');
  fill('#07C');
  noStroke();

  let timeStep = 1 / 60;
  let velocityIterations = 50;
  let positionIterations = 25;
  thisWorld.world.step(timeStep, velocityIterations, positionIterations);
  thisWorld.frameUpdate();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  thisWorld.mouseEventType = MOUSE_PRESSED;
}

function mouseReleased() {
  thisWorld.mouseEventType = MOUSE_OVER;
}
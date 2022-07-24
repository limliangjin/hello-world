"use strict"

var t = 0;
var settings = null;
var L0, g0, angle00 = 0;
var coolDown = 20;


var pendulumPeriod = (L, g, T0) =>
{
  let T = 2 * Math.PI * (L/g)**0.5;
  T *= (1 + 1/16*T0**2 + 11/3072*T0**4 + 173/737280*T0**6 + 22931/1321205760*T0**8 + 1319183/951268147200*T0**10 + 233526463/2009078326886400*T0**12)
  return T;
}

var pendulumAngle = (T0, w, t) =>
{
  let ep = (1.0 - (Math.cos(0.5*T0))**0.5) / (2.0 + 2.0 * (Math.cos(0.5 * T0))** 0.5);
  let q =  ep + 2.0 * ep**5 + 15.0 * ep**9 + 150 * ep**13 + 1707 * ep**17 + 20910 * ep**21
  let n = 30;
  let T = 0;
  let k = 1.0;
  for (let i = 1; i < n; i += 2)
  {
    T += k*(1.0)**(i / 2.0) / i * q**(0.5 * i) / (1.0 + q**i) * Math.cos(i * w * t);
    k *= -1.0;
  }
  T *= 8.0;
  return T;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  settings = QuickSettings.create(10, 10, 'Pendulum');
  settings.setCollapsible(true);
  settings.addRange("Length", 120, 700, 300, 1, function(value) { output("Length", value)})
  .addRange("Gravity", 1, 10, 1, 0.1, function(value) { output("Gravity", value)})
  .addRange("Max Angle (°)", 0.1, 179.9, 45, 0.01, function(value) { output("Max Angle", value)})
  .setKey("o")
}

function draw() {

  let midX = windowWidth / 2;
  let midY = windowHeight / 2;

  background('#222');
  fill('#07C');
  noStroke();

  let L = settings.getValue("Length");
  let g = settings.getValue("Gravity");;
  let angle0 = settings.getValue("Max Angle (°)")  / 180 * Math.PI;
  let period = pendulumPeriod(L, g, angle0);

  if (L0 != L || g0 != g || angle00 != angle0)
  {
    coolDown = 10;
    L0 = L;
    g0 = g;
    angle00 = angle0;
  }

  coolDown -= 1;
  if (coolDown > 0) t = 0;
  else t += 1;
  let T = pendulumAngle(angle0, 2 * Math.PI / period, t);


  translate(midX, midY)
  rotate(T)
  fill('#038');
  rect(-5, -5, 10, L);
  fill('#07C');
  ellipse(0, L, 100, 100);
  ellipse(0, 0, 50, 50);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
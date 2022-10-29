'use strict';

var points = [];
var delaunay;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background('#222');

  for (let i = 0; i < 100; ++i)
    for (let j = 0; j < 100; ++j){
      points.push(10+20*i);
      points.push(10+20*j);
    }

  delaunay = new Delaunator(points);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


function draw() {
  let nPoints = points.length / 2;
  stroke('#fff');
  for (let i = 0; i < nPoints; ++i) {
    ellipse(points[2 * i], points[2 * i + 1], 5, 5);
  }
  

  for (let i = 0; i < delaunay.triangles.length / 3; ++i){
    let p1 = delaunay.triangles[3*i];
    let p2 = delaunay.triangles[3*i + 1];
    let p3 = delaunay.triangles[3*i + 2];
    line(points[2*p1], points[2*p1+1], points[2*p2], points[2*p2+1]);
    line(points[2*p2], points[2*p2+1], points[2*p3], points[2*p3+1]);
    line(points[2*p3], points[2*p3+1], points[2*p1], points[2*p1+1]);
  }
}
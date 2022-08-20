"use strict"

class P5Button{
  constructor(eventHandler, x, y, w, h, text, callFunction){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.text = text;
    this.color = "#FFF";
    this.mouseOverColor = "#BBB";
    eventHandler.add(this);
    this.callFunction = callFunction
  }

  isMouseOver(){
    return mouseX >= (this.x - this.w/2) && mouseX <= (this.x + this.w/2) &&
    mouseY >= (this.y - this.h/2) && mouseY <= (this.y + this.h/2)

  }

  getColor(){
    if (this.isMouseOver()) return this.mouseOverColor;
    else return this.color;
  }

  draw(){
    fill('#333')
    rect(this.x - this.w/2, this.y - this.h/2, this.w,this.h);
    push();
    stroke('#FFF');
    noFill();
    stroke(this.getColor());
    strokeWeight(2);
    rect(this.x - this.w/2, this.y - this.h/2, this.w,this.h);
    textAlign(CENTER, CENTER);
    strokeWeight(1);
    textSize(0.6 * this.h);
    text(this.text, this.x, this.y);
    pop();
  }

  onClicked(){
    if (!this.isMouseOver()) return;
    window.navigator.vibrate(200);
    this.callFunction();
  }
}

class MouseEventHandler{
  constructor(){
    this.UIs = [];
  }

  add(ui){
    this.UIs.push(ui);
  }

  checkOnClick(){
    for (let ui of this.UIs) ui.onClicked();
  }
}
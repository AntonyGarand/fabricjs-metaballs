// Glitch variable, to be able to use `fabric` without the annoying error
var fabric = window.fabric || {};
import { Vector,  } from './vector.js';
import { MetaBall, update, getPosition } from './metaball.js';

const canvas = new fabric.Canvas("c", {renderOnAddRemove: false });
window.canvas = canvas;

canvas.on('object:moving', (event) => {
  update(canvas);
});

function heron(a,b,c){
  const s = (a + b + c) / 2;
  return Math.sqrt(s * (s-a) * (s-b) * (s-c));
}

const rows = 3;
const cols = 4;
const xOffset = canvas.width / cols / 2;
const yOffset = canvas.height / rows / 2;
const xStep = canvas.width / cols;
const yStep = canvas.height / rows;

const balls = rows * cols;

for(let i = 0; i < balls; i++){
  const position = {
    x: ((i % cols) * xStep) + xOffset, 
    y: (Math.floor(i / cols) * yStep) + yOffset, 
  }
  
  const ball = MetaBall(position, {evented: false, isAnimated: true}, ~~(Math.random()*50)+40);
  canvas.add(ball);
  
  animate(ball);
}

const ball = MetaBall({x: canvas.width/2, y: canvas.height/2}, {fill: 'white', stroke: 'black',strokeWidth:2}, ~~(Math.random()*50)+60);
canvas.add(ball);

update(canvas);
canvas.requestRenderAll();


function animate(ball, distance = 30){
  const delay = ~~(Math.random()*1000)+500;
  const original = ball.originalPosition;
  const newPosition = original.add(getRandomOffset(distance));
  
  ball.animate({top: newPosition.y, left: newPosition.x}, {
    duration: delay,
    onChange: update(canvas),
    onComplete:  () =>animate(ball, distance),
    // easing: fabric.util.ease.easeInOutCubic,
  });
  
}

function getRandomOffset(within = 50, ){
  const offsetTop = ~~(Math.random()*2*within)-within;
  const offsetLeft = ~~(Math.random()*2*within)-within;
  return new Vector(offsetTop, offsetLeft);
}

const originalAnimate = animate;
let current = animate;
let other = () => {};
document.getElementById('toggle-animations').addEventListener('click', () => {
  animate = other;
  other = current;
  current = animate;
  if(current === originalAnimate){
    canvas.getObjects().filter(o=>o.isAnimated).forEach(o=>animate(o,30));
  }
  canvas.requestRenderAll();
});

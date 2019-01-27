// Glitch variable, to be able to use `fabric` without the annoying error
var fabric = window.fabric || {};
import { Vector } from './vector.js';

const MetaBall = (position, attributes, radius) => {
  // Attributes: fill, stroke
  // position: Vector (x, y)
  const ball = createCircle(position, attributes, radius);
  ball.customType = 'metaball';
  
  const createLink = (otherBall) => {
    if(!ball.canvas) return;
      
    if(!ball.metaballs[otherBall.id]){
      ball.metaballs[otherBall.id] = {};
    }
    
    const linkMetadata = ball.metaballs[otherBall.id];
    const position = getPosition(ball);
    if(linkMetadata.lasPosition && linkMetadata.lastPosition.equals(position)) return;
    
    if(linkMetadata.linkObject){
      ball.canvas.remove(linkMetadata.linkObject);
    }
    
    const otherPosition = getPosition(otherBall);
    const radius = ball.radius;
    const otherRadius = otherBall.radius;
    const distance = position.distance(otherPosition);
    const maxDistance = (2*radius + 2*otherRadius);
    
    if(distance < maxDistance && distance > Math.abs(radius - otherRadius)){
      const link = createMetaLinkObject(ball, otherBall, position, otherPosition, distance, linkMetadata.linkObject);
      // Insert the link next to the ball
      ball.canvas.insertAt(link, ball.canvas._objects.indexOf(ball));
      
      linkMetadata.linkObject = link;
    }
    linkMetadata.lastPos = getPosition(otherBall);
    
  };
  ball.originalPosition = new Vector(position.x, position.y);
  ball.createLink = createLink;
  ball.id = ~~(Math.random() * 100000)
  ball.metaballs = {};
  
  return ball;
}

const update = (canvas) => {
  if(canvas.isRendering) return;
  
  const metaballs = canvas.getObjects().filter(o => o.customType === 'metaball');
  while(metaballs.length){
    const currentBall = metaballs.pop();
    metaballs.forEach(other => currentBall.createLink(other));
  }
  
  canvas.requestRenderAll();
};



function createMetaLinkObject(ball, otherBall, C1, C2, distance, original){
  const r1 = ball.radius;
  const r2 = otherBall.radius;

  const r = distance / 2.6; // Magic number when we want the crop to stop at 2x distance for some reason

  const hypothenus = r1 + r;
  // Here, I'm finding the height height of a triangle which has the sides of the sum of the new circle's radius + existing circle radius
  // As the base of the triangle, I'm using the distance between our two balls
  const height = getHeight(distance, hypothenus, r2+r);

  // Finding the length of the first center to the projection of the new position on the base, using the pythagorean theorem
  const firstCircleToBaseDistance = Math.sqrt(Math.abs(hypothenus ** 2) - Math.abs(height ** 2));

  const direction = new Vector(otherBall.left - ball.left, otherBall.top - ball.top).normalize();
  const clockwiseDirection = direction.rotate();
  
  const base = C1.add(direction.multiply(firstCircleToBaseDistance));
  const circlePosition = base.add(clockwiseDirection.multiply(height));
  const otherCirclePosition = base.subtract(clockwiseDirection.multiply(height));

  const collidingCircle = createCircle(circlePosition, {fill: 'red'}, r);
  const otherCircle = createCircle(otherCirclePosition, {fill: 'red'}, r);
  const circleGroup = new fabric.Group([collidingCircle, otherCircle]);
  circleGroup.inverted = true;
  circleGroup.absolutePositioned = true;
  
  const intersections = {
    Firs_top: C1.add(circlePosition.subtract(C1).normalize().multiply(r1)),
    C2_top: C2.add(circlePosition.subtract(C2).normalize().multiply(r2)),
    C2_bottom: C2.add(otherCirclePosition.subtract(C2).normalize().multiply(r2)),
    C1_bottom: C1.add(otherCirclePosition.subtract(C1).normalize().multiply(r1)),
  }
  const fillPoly = new fabric.Polygon(Object.values(intersections),{
      fill: "black",
      evented: false,
      hasControls: false,
      hasBorders: false,
      clipPath: circleGroup
    });
  
  return fillPoly;  
}

function getHeight(base, side2, side3){
  const area = heron(base, side2, side3);
  return 2 * area / (base);
}

function heron(a, b, c) {
	const s = (a + b + c) / 2;
	return Math.sqrt(s * (s - a) * (s - b) * (s - c));
}

function createCircle(position, attributes = {}, radius = 10){
  return new fabric.Circle({
    radius,
    fill: 'black',
    stroke: false,
    originX: 'center',
    originY: 'center',
    top: position.y,
    left: position.x,
    objectCaching: false,
    hasControls: false,
    hasBorders: false,
    ...attributes
  });
}

function getPosition(ball){
  return new Vector(ball.left, ball.top)
}

function throttle(func, limit) {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export { MetaBall, update, getPosition };

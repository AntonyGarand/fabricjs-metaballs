export class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  multiply(scalar) {
    return new Vector(this.x * scalar, this.y * scalar);
  }

  divide(scalar) {
    return new Vector(this.x / scalar, this.y / scalar);
  }

  add(otherVector) {
    return new Vector(
      this.x + otherVector.x,
      this.y + otherVector.y,
    );
  }

  subtract(otherVector) {
    return new Vector(
      this.x - otherVector.x,
      this.y - otherVector.y,
    );
  }

  normalize() {
    const scale = Math.sqrt(this.x ** 2 + this.y ** 2);
    return this.divide(scale);
  }

  distance(other){
    if(this.equals(other)){
      return 0;
    }
    return Math.sqrt(
      (this.x - other.x)**2 +
      (this.y - other.y)**2
    );
  }
  
  rotate(){
    return new Vector(this.y, -this.x);
  }
  flip(){
    return new Vector(-this.x, -this.y);
  }

  equals(other){
    return this.x === other.x && this.y === other.y;
  }
  length(){
    return this.distance(new Vector(0,0));
  }
}

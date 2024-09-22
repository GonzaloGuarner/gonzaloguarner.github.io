let fish = [];
let predator;
let numFish = 100;

function setup() {
    let container = document.getElementById('canvas-container');
    let cnv = createCanvas(container.offsetWidth, container.offsetHeight);
    cnv.parent('canvas-container')
  
  // Create fish
  for (let i = 0; i < numFish; i++) {
    fish.push(new Fish(random(width), random(height)));
  }
  
  // Create predator
  predator = new Predator(width / 2, height / 2);
}

function draw() {
  background(33, 30, 31, 150); // Semi-transparent background for trailing effect
  
  // Update and display fish
  for (let boid of fish) {
    boid.flock(fish, predator);
    boid.update();
    boid.edges();
    boid.show();
  }
  
  // Update and display predator
  predator.hunt(fish);
  predator.update();
  predator.edges();
  predator.show();
}

function windowResized() {
    let container = document.getElementById('canvas-container');
  resizeCanvas(container.offsetWidth, container.offsetHeight);
}
class Fish {
    constructor(x, y) {
      this.position = createVector(x, y);
      this.velocity = p5.Vector.random2D();
      this.velocity.setMag(random(2, 4));
      this.acceleration = createVector();
      this.maxForce = 0.2; // Steering force
      this.maxSpeed = 4;   // Maximum speed
      this.perceptionRadius = 50;
    }
    
    flock(fish, predator) {
      let alignment = this.align(fish);
      let cohesion = this.cohere(fish);
      let separation = this.separate(fish);
      let avoidance = this.avoid(predator);
      
      // Adjust weighting
      alignment.mult(1.0);
      cohesion.mult(1.0);
      separation.mult(1.5);
      avoidance.mult(2.0);
      
      this.acceleration.add(alignment);
      this.acceleration.add(cohesion);
      this.acceleration.add(separation);
      this.acceleration.add(avoidance);
    }
    
    align(fish) {
      let perceptionRadius = this.perceptionRadius;
      let steering = createVector();
      let total = 0;
      for (let other of fish) {
        let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
        if (other != this && d < perceptionRadius) {
          steering.add(other.velocity);
          total++;
        }
      }
      if (total > 0) {
        steering.div(total);
        steering.setMag(this.maxSpeed);
        steering.sub(this.velocity);
        steering.limit(this.maxForce);
      }
      return steering;
    }
    
    cohere(fish) {
      let perceptionRadius = this.perceptionRadius;
      let steering = createVector();
      let total = 0;
      for (let other of fish) {
        let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
        if (other != this && d < perceptionRadius) {
          steering.add(other.position);
          total++;
        }
      }
      if (total > 0) {
        steering.div(total);
        steering.sub(this.position);
        steering.setMag(this.maxSpeed);
        steering.sub(this.velocity);
        steering.limit(this.maxForce);
      }
      return steering;
    }
    
    separate(fish) {
      let perceptionRadius = this.perceptionRadius / 2;
      let steering = createVector();
      let total = 0;
      for (let other of fish) {
        let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
        if (other != this && d < perceptionRadius) {
          let diff = p5.Vector.sub(this.position, other.position);
          diff.div(d); // Weight by distance
          steering.add(diff);
          total++;
        }
      }
      if (total > 0) {
        steering.div(total);
        steering.setMag(this.maxSpeed);
        steering.sub(this.velocity);
        steering.limit(this.maxForce);
      }
      return steering;
    }
    
    avoid(predator) {
      let perceptionRadius = this.perceptionRadius * 2;
      let steering = createVector();
      let d = dist(this.position.x, this.position.y, predator.position.x, predator.position.y);
      if (d < perceptionRadius) {
        let diff = p5.Vector.sub(this.position, predator.position);
        diff.div(d); // Weight by distance
        steering.add(diff);
        steering.setMag(this.maxSpeed);
        steering.sub(this.velocity);
        steering.limit(this.maxForce * 2); // Stronger force
      }
      return steering;
    }
    
    update() {
      this.position.add(this.velocity);
      this.velocity.add(this.acceleration);
      this.velocity.limit(this.maxSpeed);
      this.acceleration.mult(0);
    }
    
    edges() {
      if (this.position.x > width) this.position.x = 0;
      else if (this.position.x < 0) this.position.x = width;
      if (this.position.y > height) this.position.y = 0;
      else if (this.position.y < 0) this.position.y = height;
    }

    respawn() {
        this.position = createVector(random(width), random(height));
        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(random(2, 4));
        this.acceleration.mult(0);
      }
    
    show() {
      strokeWeight(8);
      stroke(153, 149, 240);
      point(this.position.x, this.position.y);
    }
  }
  class Predator {
    constructor(x, y) {
      this.position = createVector(x, y);
      this.velocity = p5.Vector.random2D();
      this.velocity.setMag(3);
      this.acceleration = createVector();
      this.maxForce = 0.5;
      this.maxSpeed = 5;
      this.eatingDistance = 8;
      this.eatingDistanceSquared = 64;
    }
    
    hunt(fish) {
      // Find the closest fish
      let closest = null;
      let record = Infinity;
        // for (let boid of fish) {
        //     let dSquared = (this.position.x - boid.position.x) ** 2 + (this.position.y - boid.position.y) ** 2;
        //     if (dSquared < record) {
        //         record = dSquared;
        //         closest = boid;
        //     }
        // }
        // if (closest) {
        //     this.seek(closest.position);
        //     if (record < eatingDistanceSquared) {
        //         // Directly tell the fish to respawn
        //         closest.respawn();
        //     }
        // }
    }
    
    seek(target) {
      let desired = p5.Vector.sub(target, this.position);
      desired.setMag(this.maxSpeed);
      let steering = p5.Vector.sub(desired, this.velocity);
      steering.limit(this.maxForce);
      this.acceleration.add(steering);
    }
    
    update() {
      this.position.add(this.velocity);
      this.velocity.add(this.acceleration);
      this.velocity.limit(this.maxSpeed);
      this.acceleration.mult(0);
    }
    
    edges() {
      if (this.position.x > width) this.position.x = 0;
      else if (this.position.x < 0) this.position.x = width;
      if (this.position.y > height) this.position.y = 0;
      else if (this.position.y < 0) this.position.y = height;
    }
    
    show() {
      strokeWeight(16);
      stroke(220, 50, 50);
      point(this.position.x, this.position.y);
    }
  }
  
let fish = [];
let predator;
let numFish = 100;
let grid;
let gridSize = 100; // Size based on perception radius

function setup() {
  let container = document.getElementById('canvas-container');
  let cnv = createCanvas(container.offsetWidth, container.offsetHeight);
  cnv.parent('canvas-container');

  for (let fishIndex = 0; fishIndex < numFish; fishIndex++) {
    fish.push(new Fish(random(width), random(height), fishIndex)); 
  }

  predator = new Predator(width / 2, height / 2);

  grid = new SpatialGrid(width, height, gridSize);
}

function draw() {
  background(37, 33, 34, 100); // Semi-transparent background for trailing effect

  // Update the spatial grid
  grid.clear();
  for (let boid of fish) {
    grid.add(boid);
  }

  // Update and display fish
  for (let boid of fish) {
    boid.flock(grid, predator);
    boid.update();
    boid.edges();
  }
  // Batch draw all fish
  Fish.showAll(fish);

  // Update and display predator
  predator.hunt(grid);
  predator.update();
  predator.edges();
  predator.show();
}

function windowResized() {
    let container = document.getElementById('canvas-container');
  resizeCanvas(container.offsetWidth, container.offsetHeight);
}
class Fish {
  constructor(x, y, index) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, 4));
    this.acceleration = createVector();
    this.maxForce = 0.2; // Steering force
    this.maxSpeed = 4; // Maximum speed
    this.perceptionRadius = 50;
    this.perceptionRadiusSquared = this.perceptionRadius ** 2;
    this.index = index; // Store the fish's index
  }

  flock(grid, predator) {
    let neighbors = grid.query(this);
    let alignment = this.align(neighbors);
    let cohesion = this.cohere(neighbors);
    let separation = this.separate(neighbors);
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

  align(neighbors) {
    let perceptionRadiusSquared = this.perceptionRadiusSquared;
    let steering = createVector();
    let total = 0;

    for (let other of neighbors) {
      if (other !== this) {
        let dx = this.position.x - other.position.x;
        let dy = this.position.y - other.position.y;
        let dSquared = dx * dx + dy * dy;

        if (dSquared < perceptionRadiusSquared) {
          steering.add(other.velocity);
          total++;
        }
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

  cohere(neighbors) {
    let perceptionRadiusSquared = this.perceptionRadiusSquared;
    let steering = createVector();
    let total = 0;

    for (let other of neighbors) {
      if (other !== this) {
        let dx = this.position.x - other.position.x;
        let dy = this.position.y - other.position.y;
        let dSquared = dx * dx + dy * dy;

        if (dSquared < perceptionRadiusSquared) {
          steering.add(other.position);
          total++;
        }
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

  separate(neighbors) {
    let perceptionRadiusSquared = (this.perceptionRadius / 2) ** 2;
    let steering = createVector();
    let total = 0;

    for (let other of neighbors) {
      if (other !== this) {
        let dx = this.position.x - other.position.x;
        let dy = this.position.y - other.position.y;
        let dSquared = dx * dx + dy * dy;

        if (dSquared < perceptionRadiusSquared) {
          let diff = p5.Vector.sub(this.position, other.position);
          let d = sqrt(dSquared) + 0.00001; // Avoid division by zero
          diff.div(d); // Weight by distance
          steering.add(diff);
          total++;
        }
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
    let perceptionRadiusSquared = (this.perceptionRadius * 2) ** 2;
    let steering = createVector();
    let dx = this.position.x - predator.position.x;
    let dy = this.position.y - predator.position.y;
    let dSquared = dx * dx + dy * dy;

    if (dSquared < perceptionRadiusSquared) {
      let diff = p5.Vector.sub(this.position, predator.position);
      let d = sqrt(dSquared) + 0.00001; // Avoid division by zero
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
    this.position.x = (this.position.x + width) % width; //Not suitable for lightspeed-speeds
    this.position.y = (this.position.y + height) % height;
  }

  respawn() {
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, 4));
    this.acceleration.mult(0);
  }

  // Static method to batch draw all fish
  static showAll(fishArray) {
    strokeWeight(8);
    stroke(240, 240, 245);
    beginShape(POINTS);
    for (let fish of fishArray) {
      vertex(fish.position.x, fish.position.y);
    }
    endShape();
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
      this.eatingDistanceSquared = 8 ** 2;
    }
  
    hunt(grid) {
      let neighbors = grid.queryPosition(this.position.x, this.position.y);
  
      let closest = null;
      let record = Infinity;
      for (let boid of neighbors) {
        let dx = this.position.x - boid.position.x;
        let dy = this.position.y - boid.position.y;
        let dSquared = dx * dx + dy * dy;
        if (dSquared < record) {
          record = dSquared;
          closest = boid;
        }
      }
      if (closest) {
        this.seek(closest.position);
        if (record < this.eatingDistanceSquared) {
          closest.respawn();
        }
      }
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
      this.position.x = (this.position.x + width) % width;
      this.position.y = (this.position.y + height) % height;
    }
  
    show() {
      strokeWeight(16);
      stroke(213, 35, 70);
      point(this.position.x, this.position.y);
    }
  }

  class SpatialGrid {
    constructor(width, height, cellSize) {
      this.cols = Math.ceil(width / cellSize);
      this.rows = Math.ceil(height / cellSize);
      this.cellSize = cellSize;
      this.cells = Array.from({ length: this.cols * this.rows }, () => []);
    }
  
    clear() {
      for (let cell of this.cells) {
        cell.length = 0;
      }
    }
  
    getIndex(x, y) {
      let col = Math.floor(x / this.cellSize);
      let row = Math.floor(y / this.cellSize);
      return col + row * this.cols;
    }
  
    add(boid) {
      let index = this.getIndex(boid.position.x, boid.position.y);
      if (index >= 0 && index < this.cells.length) {
        this.cells[index].push(boid);
        boid.cellIndex = index;
      }
    }
  
    query(boid) {
      let neighbors = [];
      let col = Math.floor(boid.position.x / this.cellSize);
      let row = Math.floor(boid.position.y / this.cellSize);
  
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          let neighborCol = col + i;
          let neighborRow = row + j;
          if (
            neighborCol >= 0 &&
            neighborCol < this.cols &&
            neighborRow >= 0 &&
            neighborRow < this.rows
          ) {
            let index = neighborCol + neighborRow * this.cols;
            neighbors = neighbors.concat(this.cells[index]);
          }
        }
      }
      return neighbors;
    }
  
    queryPosition(x, y) {
      let neighbors = [];
      let col = Math.floor(x / this.cellSize);
      let row = Math.floor(y / this.cellSize);
  
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          let neighborCol = col + i;
          let neighborRow = row + j;
          if (
            neighborCol >= 0 &&
            neighborCol < this.cols &&
            neighborRow >= 0 &&
            neighborRow < this.rows
          ) {
            let index = neighborCol + neighborRow * this.cols;
            neighbors = neighbors.concat(this.cells[index]);
          }
        }
      }
      return neighbors;
    }
  }
let fish = [];
let predator;
let numFish = 100;
let grid;
let gridSize = 100; // Size based on perception radius (2-4x)

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
  for (let f of fish) {
    grid.add(f);
  }

  // Update and display fish
  for (let f of fish) {
    f.flock(grid, predator);
    f.update();
    f.edges();
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
    if (this.position.x >= width) this.position.x = this.position.x % width;
    else if (this.position.x < 0) this.position.x = (this.position.x + width) % width;
    if (this.position.y >= height) this.position.y = this.position.y % height;
    else if (this.position.y < 0) this.position.y = (this.position.y + height) % height;
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
    this.position = createVector(x, y);                // Predator's position
    this.velocity = p5.Vector.random2D();              // Initial random velocity
    this.velocity.setMag(3);                           // Set initial speed
    this.acceleration = createVector();                // Acceleration vector
    this.maxForce = 0.5;                               // Maximum steering force
    this.maxSpeed = 5;                                 // Maximum speed
    this.eatingDistanceSquared = 8 ** 2;               // Distance at which prey is eaten
    this.noiseOffset = random(1000);                   // Perlin noise offset for x
    this.noiseOffsetY = random(1000);                  // Perlin noise offset for y
    this.noiseIncrement = 0.01;                        // Controls the smoothness of movement
  }

  // Main behavior method
  hunt(grid) {
    // Query nearby cells in the spatial grid
    let neighbors = grid.queryPosition(this.position.x, this.position.y);

    let closest = null;
    let record = Infinity;

    // Find the closest prey (fish)
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
      // If prey is detected, seek it
      this.seek(closest.position);
      if (record < this.eatingDistanceSquared) {
        // Consume the prey and respawn it elsewhere
        closest.respawn();
      }
    } else {
      // If no prey is detected, wander using Perlin noise
      this.perlinWander();
    }
  }

  // Perlin noise-based wandering behavior
  perlinWander() {
    // Generate angles based on Perlin noise values
    let angleX = map(noise(this.noiseOffset), 0, 1, -PI, PI);
    let angleY = map(noise(this.noiseOffsetY), 0, 1, -PI, PI);

    // Create a force vector using the calculated angles
    let force = createVector(cos(angleX), sin(angleY));

    force.setMag(this.maxForce); // Scale the force to maximum steering force

    // Apply the wandering force to the predator's acceleration
    this.acceleration.add(force);

    // Increment noise offsets for smooth transitions in Perlin noise
    this.noiseOffset += this.noiseIncrement;
    this.noiseOffsetY += this.noiseIncrement;
  }

  // Method to steer towards a target position
  seek(target) {
    let desired = p5.Vector.sub(target, this.position); // Desired velocity
    desired.setMag(this.maxSpeed);                      // Scale to maximum speed
    let steering = p5.Vector.sub(desired, this.velocity); // Steering force
    steering.limit(this.maxForce * 1.5);                // Limit to maximum force
    this.acceleration.add(steering);                    // Apply steering force
  }

  // Update predator's position and velocity
  update() {
    this.velocity.add(this.acceleration);               // Update velocity
    this.velocity.limit(this.maxSpeed);                 // Limit speed
    this.position.add(this.velocity);                   // Update position
    this.acceleration.mult(0);                          // Reset acceleration
  }

  // Handle wrapping around the edges of the canvas
  edges() {
    this.position.x = (this.position.x + width) % width;
    this.position.y = (this.position.y + height) % height;
  }

  // Render the predator on the canvas
  show() {
    push();
    translate(this.position.x, this.position.y);
    rotate(this.velocity.heading());                    // Rotate to face direction of movement
    noStroke();
    fill(213, 35, 70);                                  // Predator color
    // Draw a triangle representing the predator
    triangle(0, -10, -5, 5, 5, 5);
    pop();
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
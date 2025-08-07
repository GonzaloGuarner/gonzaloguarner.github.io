let fish = [];
let predator;
let numFish = 100;
let grid;
let gridSize = 100; // Larger than perception radius

function setup() {
  let container = document.getElementById('canvas-container');
  let cnv = createCanvas(container.offsetWidth, container.offsetHeight);
  cnv.parent('canvas-container');

  // Initialize fish
  for (let i = 0; i < numFish; i++) {
    fish.push(new Fish(random(width), random(height), i)); 
  }

  predator = new Predator(width / 2, height / 2);

  grid = new SpatialGrid(width, height, gridSize);

  window.addEventListener('resize', containerResized);
  document.addEventListener('masonryLayoutComplete', containerResized);
}

function draw() {
  background(60, 55, 55, 100); // Semi-transparent background for trail effect

  // Update spatial grid
  grid.clear();
  for (let f of fish) {
    grid.add(f);
  }

  // Update fish
  for (let f of fish) {
    f.flock(grid, predator);
    f.update();
    f.edges();
  }
  Fish.showAll(fish); // Draw all fish

  // Update predator
  predator.hunt(grid);
  predator.update();
  predator.edges();
  predator.show();
}

function containerResized() {
  let container = document.getElementById('canvas-container');
  resizeCanvas(container.offsetWidth, container.offsetHeight);
}

class Fish {
  constructor(x, y, index) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D().setMag(random(2, 4));
    this.acceleration = createVector();
    this.maxForce = 0.2;
    this.maxSpeed = 4;
    this.perceptionRadius = 50;
    this.perceptionRadiusSquared = this.perceptionRadius ** 2;
    this.index = index; // For tracking purposes
  }

  flock(grid, predator) {
    let neighbors = grid.query(this);
    let alignment = this.align(neighbors);
    let cohesion = this.cohere(neighbors);
    let separation = this.separate(neighbors);
    let avoidance = this.avoid(predator);

    // Adjust weights
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
    let steering = createVector();
    let total = 0;

    for (let other of neighbors) {
      if (other !== this) {
        let dx = this.position.x - other.position.x;
        let dy = this.position.y - other.position.y;
        let dSquared = dx * dx + dy * dy;

        if (dSquared < this.perceptionRadiusSquared) {
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
    let jitter = p5.Vector.random2D().mult(0.2); 
    // 0.05 is the strength of the jitter; tweak up/down.
    steering.add(jitter);
    return steering;
  }

  cohere(neighbors) {
    let steering = createVector();
    let total = 0;

    for (let other of neighbors) {
      if (other !== this) {
        let dx = this.position.x - other.position.x;
        let dy = this.position.y - other.position.y;
        let dSquared = dx * dx + dy * dy;

        if (dSquared < this.perceptionRadiusSquared) {
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
          let d = sqrt(dSquared) + 0.00001; // Prevent division by zero
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
      let d = sqrt(dSquared) + 0.00001; // Prevent division by zero
      diff.div(d);
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
    this.acceleration.mult(0); // Reset acceleration
  }

  edges() {
    // Wrap around edges
    if (this.position.x >= width) this.position.x %= width;
    else if (this.position.x < 0) this.position.x = (this.position.x + width) % width;
    if (this.position.y >= height) this.position.y %= height;
    else if (this.position.y < 0) this.position.y = (this.position.y + height) % height;
  }

  respawn() {
    // Respawn at a random position
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D().setMag(random(2, 4));
    this.acceleration.mult(0);
  }

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
    this.velocity = p5.Vector.random2D().setMag(3);
    this.acceleration = createVector();
    this.maxForce = 0.5;
    this.maxSpeed = 5;
    this.eatingDistanceSquared = 8 ** 2;
    this.noiseOffset = random(1000);
    this.noiseOffsetY = random(1000);
    this.noiseIncrement = 0.01;
  }

  hunt(grid) {
    let neighbors = grid.queryPosition(this.position.x, this.position.y);

    let closest = null;
    let record = Infinity;

    // Find the closest fish
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
        closest.respawn(); // Eat the fish
      }
    } else {
      this.perlinWander(); // Wander around
    }
  }

  perlinWander() {
    let angleX = map(noise(this.noiseOffset), 0, 1, -PI, PI);
    let angleY = map(noise(this.noiseOffsetY), 0, 1, -PI, PI);

    let wanderingForce = createVector(cos(angleX), sin(angleY));
    wanderingForce.setMag(this.maxForce);

    this.acceleration.add(wanderingForce);

    this.noiseOffset += this.noiseIncrement;
    this.noiseOffsetY += this.noiseIncrement;
  }

  seek(target) {
    let desired = p5.Vector.sub(target, this.position).setMag(this.maxSpeed);
    let steering = p5.Vector.sub(desired, this.velocity);
    steering.limit(this.maxForce * 1.5);
    this.acceleration.add(steering);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0); // Reset acceleration
  }

  edges() {
    // Wrap around edges
    this.position.x = (this.position.x + width) % width;
    this.position.y = (this.position.y + height) % height;
  }

  show() {
    noStroke();
    fill(213, 35, 70); // Predator color
    circle(this.position.x, this.position.y, 16);
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
          neighborCol >= 0 && neighborCol < this.cols &&
          neighborRow >= 0 && neighborRow < this.rows
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
          neighborCol >= 0 && neighborCol < this.cols &&
          neighborRow >= 0 && neighborRow < this.rows
        ) {
          let index = neighborCol + neighborRow * this.cols;
          neighbors = neighbors.concat(this.cells[index]);
        }
      }
    }
    return neighbors;
  }
}

let handPose;
let faceMesh;

let video;

let faceOptions = { maxFaces: 2, refineLandmarks: false, flipped: true };
let faces = [];
let connectionsFace;

let hands = [];
let connectionsHand;

class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    // Give it a very small initial velocity
    this.vel = createVector(random(-0.5, 0.5), random(-1, -2)); 
    this.lifespan = 255;
    this.r = 20;
  }

  update() {
    // Add an upward force to simulate buoyancy
    let gravity = createVector(0, -0.05); 
    this.vel.add(gravity);
    
    // Add a slight horizontal force for a wavering, smoky effect
    this.vel.x += random(-0.05, 0.05);

    this.pos.add(this.vel);
    this.lifespan -= 2;
  }

  display() {
    noStroke();
    // Change color to white/gray for smoke, and use a lower alpha for a hazy look
    fill(255, this.lifespan * 0.5); 
    // Make particles smaller over time
    let currentR = map(this.lifespan, 255, 0, this.r, 0); 
    ellipse(this.pos.x, this.pos.y, currentR * 2);
  }

  isDead() {
    return this.lifespan < 0;
  }
}

class Emitter {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.particles = [];
  }

  addParticle() {
    this.particles.push(new Particle(this.pos.x, this.pos.y));
  }

  run() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update();
      p.display();
      if (p.isDead()) {
        this.particles.splice(i, 1); // Removes dead particles
      }
    }
  }
}

let emitter;

function preload(){
    handPose = ml5.handPose({flipped: true});
    faceMesh = ml5.faceMesh(faceOptions);
}

function setup() {
    createCanvas(680, 460);
    video = createCapture(VIDEO, {flipped: true});
    video.size(width, height);
    video.hide();
    connectionsHand = handPose.getConnections();

    handPose.detectStart(video, gotHands);
    faceMesh.detectStart(video, gotFaces);
}

function gotFaces(results) {
    faces = results;
}

function gotHands(results) {
    hands = results;
}

function mousePressed(){
    console.log(faces);
}

function draw() {
    background(0);
    //image(video, 0, 0, width, height); // uncomment to show video feed
    for (let i = 0; i < faces.length; i++) {
        let face = faces[i];
        let lips = face.lips;
        for (let j = 0; j < face.keypoints.length; j++) {
            let keypoint = face.keypoints[j];
            stroke(0, 255, 0);
            noFill();
            circle(keypoint.x, keypoint.y, 2);
        }

        let a = face.keypoints[13];
        let b = face.keypoints[14];
        //fill(0, 255, 0);
        //circle(a.x, a.y, 10);
        //circle(b.x, b.y, 10);
        
        if (a && b) {
            let d = dist(a.x, a.y, b.x, b.y);
            let threshold = 12;

            if (d > threshold) {
                let midX = (a.x + b.x) / 2;
                let midY = (a.y + b.y) / 2;

                if (!emitter) {
                    emitter = new Emitter(midX, midY);
                } else {
                    emitter.pos.x = midX;
                    emitter.pos.y = midY;
                }

                emitter.addParticle();
            }
        }
    }

    if (emitter) {
        emitter.run();
    }

    for (let i = 0; i < hands.length; i++) {
        let hand = hands[i];
        // Draw skeletal connections first so keypoint circles render on top
        if (connectionsHand && connectionsHand.length && hand.keypoints && hand.keypoints.length) {
            stroke(0, 255, 0);
            strokeWeight(1);
            noFill();
            for (let c = 0; c < connectionsHand.length; c++) {
                const [a, b] = connectionsHand[c];
                const kpA = hand.keypoints[a];
                const kpB = hand.keypoints[b];
                if (kpA && kpB) {
                    line(kpA.x, kpA.y, kpB.x, kpB.y);
                }
            }
        }
        for (let j = 0; j < hand.keypoints.length; j++) {
            let keypoint = hand.keypoints[j];
            fill(0, 255, 0);
            noStroke();
            circle(keypoint.x, keypoint.y, 2);
        }

        let indexTip = hand.keypoints[8]; 

        if (indexTip) {
            push(); 
            translate(indexTip.x, indexTip.y); 

            rotate(radians(-30)); // Rotate 

            // Draw the main body 
            fill(255); 
            rect(0, 0, 80, 12); 

            // Draw the filter 
            fill(200, 100, 0); 
            rect(0, 0, 20, 12); 

            pop(); 
        }
    }
}

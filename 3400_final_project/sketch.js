/*  
  Matthew Bodenstein 
  Black Hole Manipulation

--------- Controls ---------
  Press Auto-Refresh then press Play
  Hold up Index & Pinky for Red Stars
  Hold up Thumb & Index & Pinky for Blue Stars
  Press Pause button in top left to pause simulation
  Press Toggle Video or Press V to toggle camera
  Press Rainbow Trail to toggle rainbow trails
  Use the slider at the bottom to change the length of the star trails

-------- Description --------
  This is a black hole manipulation simulation.
  Use your hand to control the size, speed, number of stars, colour, and more!
  The more fingers up the bigger the center of mass, 5 is the most, 0 is the least
*/

let video;
let handpose;
let predictions = [];
let fingersUp = 0;
let fingersUpList = [];

const fingerNames = ["Thumb", "Index", "Middle", "Ring", "Pinky"];
let blackHoleCanvas;
let particles = [];
const numBaseParticles = 500;
let showVideo = true; // Toggle video display

// Stars array to store positions of the stars
let stars = [];
const numStars = 200; // Number of stars

let gui;
let toggle_video;
let slider;

let colorModeButton;
let colorMode = "default";

let pauseButton;
let isPaused = false;

function setup() {
  createCanvas(1200, 800);
  blackHoleCanvas = createGraphics(900, 800);
  video = createCapture(VIDEO);
  video.size(250, 180);
  video.hide();
  
  console.log("Loading ML5 Handpose model...");
  handpose = ml5.handpose(video, modelReady);
  handpose.on("predict", results => {
    predictions = results;
  });

  for (let i = 0; i < numBaseParticles; i++) {
    particles.push(new Particle());
  }

  // Generate stars
  for (let i = 0; i < numStars; i++) {
    stars.push(createVector(random(width), random(height)));
  }
  
  gui = createGui();
  toggle_video = createButton("Video on/off", width - 200, 550);
  slider = createSlider("Slider", width/2 - 100, 770, 200, 32, 5, 20);
  colorModeButton = createButton("Rainbow Trail", width - 200, 500);
  pauseButton = createButton("||", 30, 30, 50, 50);
  setStyles();
}


function setStyles(){
    toggle_video.setStyle({
      fillBg: color(50, 50, 50),   // Dark gray background
      fillBgHover: color(80, 80, 80), // Lighter gray when hovered
      strokeBg: color(255, 255, 255), // White border
      fillLabel: color(255, 255, 255), // White text
    });

  colorModeButton.setStyle({
      fillBg: color(255, 0, 150),  // Bright pink background
      fillBgHover: color(255, 50, 200), // Lighter pink on hover
      strokeBg: color(0), // Black border
      fillLabel: color(255), // White text
    });

  pauseButton.setStyle({
    fillBg: color(200, 0, 0),  // Red background
    fillBgHover: color(255, 50, 50), // Lighter red hover
    strokeBg: color(255, 255, 255), // White border
    fillLabel: color(255), // White text
  });

  slider.setStyle({
    fillTrack: color(100),  // Gray track
    fillTrackHover: color(150), // Lighter gray on hover
    fillHandle: color(0, 150, 255), // Blue handle
    fillHandleHover: color(0, 200, 255), // Brighter blue handle on hover
  });
}

function modelReady() {
  console.log("Handpose model loaded!");
}

function draw() {
  background(0);
  
  // Draw stars before the black hole
  drawStars();
  
  drawBlackHole();
  image(blackHoleCanvas, 150, 0);
  
  // Toggle video display based on showVideo
  if (showVideo) {
    push();
    translate(width - 260, height - 190);
    scale(-1, 1);
    image(video, -250, 0, 250, 180);
    pop();
  }

  drawHand();
  fill(255);
  textSize(24);
  textAlign(CENTER, CENTER);
  text(`Fingers Up: ${fingersUp}`, width / 2, 750);
  text(`Raised: ${fingersUpList.length > 0 ? fingersUpList.join(", ") : "None"}`, width / 2, 720);
  
  drawGui();
  guiHandeler();
  
}


function guiHandeler(){
  
  if(toggle_video.isPressed){
      showVideo = !showVideo;
      }
  
  if (colorModeButton.isPressed) {
    colorMode = colorMode === "default" ? "rainbow" : "default";
  }
  
  if (pauseButton.isPressed) {
    isPaused = !isPaused;
  }
}


function drawStars() {
  // Draw random white dots (stars)
  for (let i = 0; i < stars.length; i++) {
    fill(255, 255, 255, random(50, 150));  // Random alpha for twinkling effect
    noStroke();
    ellipse(stars[i].x, stars[i].y, random(1, 3), random(1, 3));  // Small random-sized stars
  }
}

function drawHand() {
  if (predictions.length > 0) {
    let hand = predictions[0];
    let landmarks = hand.landmarks;
    let result = countFingers(landmarks);
    fingersUp = result.count;
    fingersUpList = result.names;

    for (let i = 0; i < landmarks.length; i++) {
      let [x, y] = landmarks[i];
      let screenX = map(x, 0, 290, 0, 250/2);
      let mirroredX = width - screenX;
      let screenY = map(y, 0, 260, 0, 180/2);
      let finalY = screenY + (height - 180);
      fill(0, 255, 0);
      noStroke();
      ellipse(mirroredX, finalY, 4, 4);
    }
  }
}

function countFingers(landmarks) {
  let count = 0;
  let raisedFingers = [];
  if (!landmarks || landmarks.length < 21) return { count: 0, names: [] };
  let thumbUp = landmarks[4][0] > landmarks[3][0];
  if (thumbUp) {
    count++;
    raisedFingers.push("Thumb");
  }
  let fingers = [8, 12, 16, 20];
  let bases = [6, 10, 14, 18];
  for (let i = 0; i < fingers.length; i++) {
    if (landmarks[fingers[i]][1] < landmarks[bases[i]][1]) {
      count++;
      raisedFingers.push(fingerNames[i + 1]);
    }
  }
  return { count, names: raisedFingers };
}

function drawBlackHole() {
  blackHoleCanvas.clear();
  blackHoleCanvas.fill(0, 10);
  blackHoleCanvas.rect(0, 0, 900, 800);
  blackHoleCanvas.push();
  blackHoleCanvas.translate(450, 400);
  
  // Shrink the center when no fingers are up
  let centerSize;

  if (fingersUpList.length === 0) {
    centerSize = 50;
  } else if (fingersUpList.length === 1) {
    centerSize = 70;
  } else if (fingersUpList.length === 2) {
    centerSize = 100;
  } else if (fingersUpList.length === 3) {
    centerSize = 150;
  } else if (fingersUpList.length === 4) {
    centerSize = 170;
  } else {
    centerSize = 200;  // Default case if fingersUpList.length is more than 4
  }
  
  // Draw the event horizon with dynamic center size
  blackHoleCanvas.fill(0);
  blackHoleCanvas.noStroke();
  blackHoleCanvas.ellipse(0, 0, centerSize, centerSize); // This represents the shrinking/expanding center
  
  drawEventHorizon();
  updateParticles();
  blackHoleCanvas.pop();
}

function drawEventHorizon() {
  blackHoleCanvas.fill(0);
  blackHoleCanvas.noStroke();
  
  // Shrink the black hole's center when no fingers are up
  let size;

  if (fingersUpList.length === 0) {
    size = 50;
  } else if (fingersUpList.length === 1) {
    size = 70;
  } else if (fingersUpList.length === 2) {
    size = 100;
  } else if (fingersUpList.length === 3) {
    size = 150;
  } else if (fingersUpList.length === 4) {
    size = 170;
  } else {
    size = 200;  // Default case if fingersUpList.length is more than 4
  }


  blackHoleCanvas.ellipse(0, 0, size, size);
} 

function updateParticles() {
  // Dynamically calculate the number of particles based on fingers up
  let numParticles = numBaseParticles + fingersUp * 100;
  
  // Adjust the black hole center size based on fingersUpList length
  let centerSize;

  if (fingersUpList.length === 0) {
    centerSize = 50;
  } else if (fingersUpList.length === 1) {
    centerSize = 70;
  } else if (fingersUpList.length === 2) {
    centerSize = 100;
  } else if (fingersUpList.length === 3) {
    centerSize = 150;
  } else if (fingersUpList.length === 4) {
    centerSize = 170;
  } else {
    centerSize = 200;  // Default case if fingersUpList.length is more than 4
  }

  
  // Ensure particles array matches the current number of particles
  while (particles.length < numParticles) {
    particles.push(new Particle(true, centerSize)); // Pass center size to Particle constructor
  }
  while (particles.length > numParticles) {
    particles.pop();
  }
  
  // Update and display each particle based on the new center size
  if (!isPaused) {
    for (let p of particles) {
      p.update(centerSize);
      p.display();
    }
  }
}

function keyPressed() {
  // Toggle the video display when the 'v' key is pressed
  if (key === 'v' || key === 'V') {
    showVideo = !showVideo;
  }
}

class Particle {
  constructor(fromHorizon = false, centerSize = 200) {
    this.centerSize = centerSize;  // Store the current center size
    
    if (fromHorizon) {
      this.angle = random(TWO_PI);
      this.radius = centerSize * 1.5;  // Start particles just outside the center
    } else {
      this.angle = random(TWO_PI);
      this.radius = random(centerSize * 0.65, centerSize * 1.5);  // Dynamic radius based on the center size
    }
    this.x = this.radius * cos(this.angle);
    this.y = this.radius * sin(this.angle);
    this.speed = random(0.5, 2);
    this.angularSpeed = random(0.02, 0.05);
    this.trail = [];
    this.updateColor();
  }

  updateColor() {
    if (colorMode === "rainbow") {
    this.color = color(random(255), random(255), random(255));
  } else if (fingersUpList.includes("Index") && fingersUpList.includes("Pinky") && (fingersUpList.length == 2)) {
      this.color = color(255, 0, 0);
    } else if (fingersUpList.includes("Index") && fingersUpList.includes("Pinky") && fingersUpList.includes("Thumb") &&(fingersUpList.length == 3)) {
      this.color = color(0, 0, 255);
    }
    else {
      this.color = color(255, random(100, 255), 0, 200);
    }
  }

  update(centerSize) {
    this.centerSize = centerSize;
    this.angle += this.angularSpeed;
    this.radius -= this.speed * (1 + fingersUp * 0.1);

    if (this.radius < centerSize * 0.65) {
      this.radius = centerSize * 1.5;
      this.angle = random(TWO_PI);
    }

    this.x = this.radius * cos(this.angle);
    this.y = this.radius * sin(this.angle);

    this.trail.push({ x: this.x, y: this.y, color: this.color });

    // Limit trail length based on slider value
    let maxTrailLength = slider.val; 
    if (this.trail.length > maxTrailLength) {
      this.trail.shift();
    }
  }

  display() {
    for (let i = 0; i < this.trail.length; i++) {
      let alpha = map(i, 0, this.trail.length, 50, 200);
      blackHoleCanvas.fill(
        red(this.trail[i].color),
        green(this.trail[i].color),
        blue(this.trail[i].color),
        alpha
      );
      blackHoleCanvas.noStroke();
      blackHoleCanvas.ellipse(this.trail[i].x, this.trail[i].y, 5, 5);
    }
  }

}



let video;
let handpose;
let predictions = [];
let fingersUp = 0;
let fingersUpList = [];

const fingerNames = ["Thumb", "Index", "Middle", "Ring", "Pinky"];
let blackHoleCanvas;

function setup() {
  createCanvas(1200, 800); // Larger for black hole focus DO NOT TOUCH

  blackHoleCanvas = createGraphics(900, 800); // Large black hole canvas DO NOT TOUCH

  video = createCapture(VIDEO);
  video.size(250, 180); // Smaller camera DO NOT TOUCH
  video.hide();

  console.log("Loading ML5 Handpose model...");
  handpose = ml5.handpose(video, modelReady);
  handpose.on("predict", results => {
    predictions = results;
  });
}

function modelReady() {
  console.log("Handpose model loaded!");
}

function draw() {
  background(0);

  // Draw black hole (main focus)
  drawBlackHole();
  image(blackHoleCanvas, 150, 0); // Center the black hole

  // Draw the smaller camera feed in the bottom-right corner
  push();
  translate(width - 260, height - 190); // Adjusted for proper fit
  scale(-1, 1); // Mirror camera
  image(video, -250, 0, 250, 180);
  pop();

  // Draw hand tracking over the camera feed
  drawHand();

  // Display finger count
  fill(255);
  textSize(24);
  textAlign(CENTER, CENTER);
  text(`Fingers Up: ${fingersUp}`, width / 2, 750);
  text(`Raised: ${fingersUpList.length > 0 ? fingersUpList.join(", ") : "None"}`, width / 2, 720);
}

// -------------------------------------------------- HAND LOGIC --------------------------------------------------
// Hand tracking function DO NOT TOUCH
function drawHand() {
  if (predictions.length > 0) {
    let hand = predictions[0];
    let landmarks = hand.landmarks;

    let result = countFingers(landmarks);
    fingersUp = result.count;
    fingersUpList = result.names;

    for (let i = 0; i < landmarks.length; i++) {
      let [x, y] = landmarks[i];

      // Scale X to video width (250px) and flip for mirroring
      let screenX = map(x, 0, 290, 0, 250/2);
      let mirroredX = width - screenX; 
      console.log(video.width);

      // Scale Y to video height (180px)
      let screenY = map(y, 0, 260, 0, 180/2);
      let finalY = screenY + (height - 180); // Align with bottom video feed

      // Draw the hand point with smaller circles for better accuracy
      fill(0, 255, 0);
      noStroke();
      ellipse(mirroredX, finalY, 4, 4); // Slightly smaller for precision
    }
  }
}

// Count raised fingers
function countFingers(landmarks) {
  let count = 0;
  let raisedFingers = [];

  if (!landmarks || landmarks.length < 21) return { count: 0, names: [] };

  // Thumb: Compare tip (4) to knuckle (2)
  let thumbUp = landmarks[4][0] > landmarks[3][0];
  if (thumbUp) {
    count++;
    raisedFingers.push("Thumb");
  }

  // Other fingers: Check if tip (8, 12, 16, 20) is above lower joint (6, 10, 14, 18)
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
// ------------------------------------------------ END HAND LOGIC ------------------------------------------------


// Black hole visualization
function drawBlackHole() {
  blackHoleCanvas.clear();
  blackHoleCanvas.background(10);

  blackHoleCanvas.push();
  blackHoleCanvas.translate(450, 400); // Center black hole

  // Event Horizon
  blackHoleCanvas.fill(0);
  blackHoleCanvas.ellipse(0, 0, 200, 200);

  // Accretion Disk
  let numParticles = 200 + fingersUp * 20;
  let timeFactor = frameCount * 0.01 * fingersUp;

  for (let i = 0; i < numParticles; i++) {
    let angle = map(i, 0, numParticles, 0, TWO_PI) + timeFactor;
    let radius = 100 + noise(i * 0.1, frameCount * 0.005) * 50;

    let x = radius * cos(angle);
    let y = radius * sin(angle);

    let brightness = map(radius, 100, 150, 255, 150);

    blackHoleCanvas.fill(255, brightness, 0, 150);
    blackHoleCanvas.noStroke();
    blackHoleCanvas.ellipse(x, y, 5, 5);
  }

  blackHoleCanvas.pop();
}

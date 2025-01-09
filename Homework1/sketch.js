let img1, img2;
let ripples = [];
let transitioning = false; // Track the transition state

function preload() {
  // Replace with the paths to your images
  img1 = loadImage('image1.jpg');
  img2 = loadImage('image2.jpg');
}

function setup() {
  createCanvas(800, 600);
  noStroke();

  // Initialize ripple objects
  for (let i = 0; i < 2000; i++) { // Reduced number of ripples to 2000
    ripples.push({
      x: random(width),
      y: random(height),
      radius: random(2, 5), // Reduced size of ripples
      speed: random(5, 10),
      phase: random(TWO_PI),
      opacity: random(100, 255),
      dx: random(-1, 1), // Horizontal movement
      dy: random(-1, 1)  // Vertical movement
    });
  }
}

function draw() {
  background(0);

  // Blend two images together
  let t = (sin(frameCount * 0.01) + 1) / 2; // Oscillates between 0 and 1
  transitioning = t > 0 && t < 1; // Ripples only during transition phase

  blendMode(BLEND);
  image(img1, 0, 0, width, height);
  blendMode(LIGHTEST);
  tint(255, 255 * t);
  image(img2, 0, 0, width, height);
  noTint();

  if (transitioning) {
    // Draw ripple effects during transition phase only
    blendMode(OVERLAY);
    for (let ripple of ripples) {
      fill(255, 255, 0, ripple.opacity); // Yellow color with opacity
      let currentRadius = ripple.radius + sin(frameCount * 0.02 * ripple.speed + ripple.phase) * 2; // Adjusted for smaller ripples
      ellipse(ripple.x, ripple.y, currentRadius, currentRadius);
      ripple.opacity -= 0.5;

      // Move the ripple slightly
      ripple.x += ripple.dx;
      ripple.y += ripple.dy;

      // Wrap around the edges
      if (ripple.x < 0) ripple.x = width;
      if (ripple.x > width) ripple.x = 0;
      if (ripple.y < 0) ripple.y = height;
      if (ripple.y > height) ripple.y = 0;

      // Reset ripples when fully faded
      if (ripple.opacity <= 0) {
        ripple.x = random(width);
        ripple.y = random(height);
        ripple.radius = random(2, 5); // Reset with smaller size
        ripple.speed = random(5, 10);
        ripple.phase = random(TWO_PI);
        ripple.opacity = random(100, 255);
        ripple.dx = random(-1, 1); // Reset movement
        ripple.dy = random(-1, 1);
      }
    }
  }
}
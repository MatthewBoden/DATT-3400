// BY Matthew Bodenstein (217996505)
// Data source: NASA's Zonal Annual Means
// https://data.giss.nasa.gov/gistemp/tabledata_v4/ZonAnn.Ts+dSST.csv


let table;
let dataPoints = [];
let canvasWidth = 800;
let canvasHeight = 400;
let noiseOffset = []; // Array to hold individual noise offsets for each cube
let cols, rows;
let cubeSize = 20;

function preload() {
  // Load your CSV file (ensure the file is named dataset.csv and is in the same folder as this sketch)
  table = loadTable('dataset.csv', 'csv', 'header');
}

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  frameRate(30); // Slower frame rate for smoother animation

  // Parse data from the CSV
  for (let i = 0; i < table.getRowCount(); i++) {
    let year = table.getNum(i, 'Year'); // Extract Year
    let glob = table.getNum(i, 'Glob'); // Extract Glob (temperature anomaly)
    dataPoints.push({ year, glob });
  }

  // Calculate number of rows and columns for the grid of cubes
  cols = floor(width / cubeSize);
  rows = floor(height / cubeSize);

  // Initialize noise offsets for each cube in the grid
  for (let i = 0; i < cols * rows; i++) {
    noiseOffset.push(random(1000));
  }
}

function draw() {
  // Create gradient background
  for (let i = 0; i < height; i++) {
    let inter = map(i, 0, height, 0, 1);
    let c = lerpColor(color(20, 30, 40), color(0, 100, 200), inter);
    stroke(c);
    line(0, i, width, i);
  }

  // Iterate through each grid cell and create a "raindrop" cube effect
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      let x = col * cubeSize;
      let y = row * cubeSize;

      // Use the 'glob' value from CSV to control the wave effect height
      let globValue = dataPoints[floor(map(col, 0, cols, 0, dataPoints.length))].glob; // Use 'glob' value based on column position
      let waveHeight = map(globValue, -1, 1, 50, 150); // Map 'glob' to wave height (adjust range as needed)

      // Calculate noise-based wave effect for each cube
      let offset = map(noise(noiseOffset[row + col * rows]), 0, 1, -waveHeight, waveHeight); 

      // Update noise offsets more slowly to make it slower
      noiseOffset[row + col * rows] += 0.02; // Slow down the wave motion

      // Set color based on 'glob' value for a more drastic and data-driven color effect
      let r = map(globValue, -1, 1, 50, 255); // Map 'glob' to red value
      let g = map(globValue, -1, 1, 0, 255);  // Map 'glob' to green value
      let b = map(globValue, -1, 1, 255, 50); // Map 'glob' to blue value
      fill(r, g, b, 180); // Increased opacity for smoother transitions

      // Draw the cube (representing the raindrop)
      push();
      translate(x, y);
      rect(0, 0, cubeSize, cubeSize + offset); // Use offset to simulate raindrop movement
      pop();
    }
  }
}

let addButton, removeButton;

// sample sets
let loadedInstrumentSetBuffers = {};
let individualInstrumentArray = new Array(37).fill(1);

// clickable buttons for instruments
let debounceTimer;
let debounceTimerArray; 
let buttonSize = 20; // Example size of the button
let ellipseButtons = [];
let ellipseColors = [
  [255,228,209],   // Red
  [203,237,209],   // Green
  [187,234,255]    // Blue
];

// visual bars
let barColors = []; // bar colours array
let clearButton;

let numEllipses = 5;

let preventNoteCreation;

let rectX, rectY, rectWidth, rectHeight;


// Audio
// BufferLoader class to handle loading audio files
let audioBuffers = [];
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let bufferLoader;

// BufferLoader class to handle loading audio files
function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = [];
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
  let request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  let loader = this;

  request.onload = function() {
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          console.error('Error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length) {
          loader.onload(loader.bufferList);
        }
      },
      function(error) {
        console.error('decodeAudioData error for ' + url, error);
      }
    );
  };

  request.onerror = function() {
    console.error('BufferLoader: XHR error for ' + url);
  };

  request.send();
};

BufferLoader.prototype.load = function() {
  for (let i = 0; i < this.urlList.length; ++i) {
    this.loadBuffer(this.urlList[i], i);
  }
};

function preload() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  loadAudioSet(individualInstrumentArray);
}

// Function to load audio set based on individualInstrumentArray
function loadAudioSet(individualInstrumentArray) {
  let filePathsToLoad = [];
  let bufferIndicesToLoad = [];

  for (let i = 0; i < 37; i++) {
    let setNumber = individualInstrumentArray[i];
    let instrumentSet = '';

    if (setNumber === 1) {
      instrumentSet = 'comb';
    } else if (setNumber === 2) {
      instrumentSet = 'piano';
    } else if (setNumber === 3) {
      instrumentSet = 'guitar';
    } else {
      console.error(`Invalid set number ${setNumber} at index ${i}`);
      return;
    }

    let filePath = `${instrumentSet}/${i}.mp3`;
    filePathsToLoad.push(filePath);
    bufferIndicesToLoad.push(i);
  }

  if (filePathsToLoad.length > 0) {
    bufferLoader = new BufferLoader(
      audioContext,
      filePathsToLoad,
      (newBufferList) => finishedLoading(newBufferList, bufferIndicesToLoad)
    );
    bufferLoader.load();
  } else {
    // If no files need to be loaded, call finishedLoading with an empty array
    finishedLoading([], []);
  }
}

function finishedLoading(newBufferList, bufferIndicesToLoad) {
  for (let i = 0; i < newBufferList.length; i++) {
    let bufferIndex = bufferIndicesToLoad[i];
    audioBuffers[bufferIndex] = newBufferList[i];

    let setNumber = individualInstrumentArray[bufferIndex];
    let instrumentSet = '';
    if (setNumber === 1) {
      instrumentSet = 'comb';
    } else if (setNumber === 2) {
      instrumentSet = 'piano';
    } else if (setNumber === 3) {
      instrumentSet = 'guitar';
    }

    let filePath = `${instrumentSet}/${bufferIndex}.mp3`;
    loadedInstrumentSetBuffers[filePath] = newBufferList[i];
  }

  // Remove entries from loadedInstrumentSetBuffers that were not loaded in this batch
  if (newBufferList.length > 0) {
    let filePathsLoaded = newBufferList.map((buffer, index) => {
      let bufferIndex = bufferIndicesToLoad[index];
      let setNumber = individualInstrumentArray[bufferIndex];
      let instrumentSet = '';
      if (setNumber === 1) {
        instrumentSet = 'comb';
      } else if (setNumber === 2) {
        instrumentSet = 'piano';
      } else if (setNumber === 3) {
        instrumentSet = 'guitar';
      }
      return `${instrumentSet}/${bufferIndex}.mp3`;
    });

    for (let filePath in loadedInstrumentSetBuffers) {
      if (!filePathsLoaded.includes(filePath)) {
        delete loadedInstrumentSetBuffers[filePath];
      }
    }
  }
}

let majorPentatonic = {
  0: 0,
  1: 2,
  2: 4,
  3: 7,
  4: 9,
  5: 12,
  6: 14,
  7: 16,
  8: 19,
  9: 21,
  10: 24,
  11: 26,
  12: 28,
  13: 31,
  14: 33,
  15: 36
}

let minorPentatonic = {
  0: 0,
  1: 3,
  2: 5,
  3: 7,
  4: 10,
  5: 12,
  6: 15,
  7: 17,
  8: 19,
  9: 22,
  10: 24,
  11: 27,
  12: 29,
  13: 31,
  14: 34,
  15: 36
}

let ionian = {
  0: 0,
  1: 2,
  2: 4,
  3: 5,
  4: 7,
  5: 9,
  6: 11,
  7: 12,
  8: 14,
  9: 16,
  10: 17,
  11: 19,
  12: 21,
  13: 23,
  14: 24,
  15: 26
}

let dorian = {
  0: 0,
  1: 2,
  2: 3,
  3: 5,
  4: 7,
  5: 9,
  6: 10,
  7: 12,
  8: 14,
  9: 15,
  10: 17,
  11: 19,
  12: 21,
  13: 22,
  14: 24,
  15: 26
}

let mixolydian = {
  0: 0,
  1: 2,
  2: 4,
  3: 5,
  4: 7,
  5: 9,
  6: 10,
  7: 12,
  8: 14,
  9: 16,
  10: 17,
  11: 19,
  12: 21,
  13: 22,
  14: 24,
  15: 26
}

let aeolian = {
  0: 0,
  1: 2,
  2: 3,
  3: 5,
  4: 7,
  5: 8,
  6: 10,
  7: 12,
  8: 14,
  9: 15,
  10: 17,
  11: 19,
  12: 20,
  13: 22,
  14: 24,
  15: 26
}

let chromatic = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  11: 11,
  12: 12,
  13: 13,
  14: 14,
  15: 15
}

let harmonicMinor = {
  0: 0,
  1: 2,
  2: 3,
  3: 5,
  4: 7,
  5: 8,
  6: 11,
  7: 12,
  8: 14,
  9: 15,
  10: 17,
  11: 19,
  12: 20,
  13: 23,
  14: 24,
  15: 26
}

let wholeTone = {
  0: 0,
  1: 2,
  2: 4,
  3: 6,
  4: 8,
  5: 10,
  6: 12,
  7: 14,
  8: 16,
  9: 18,
  10: 20,
  11: 22,
  12: 24,
  13: 26,
  14: 28,
  15: 30
}

let octatonic = {
  0: 0,
  1: 1,
  2: 3,
  3: 4,
  4: 6,
  5: 7,
  6: 9,
  7: 10,
  8: 12,
  9: 13,
  10: 15,
  11: 16,
  12: 18,
  13: 19,
  14: 21,
  15: 22
}

// initial scale mapping (ie the default)
let scaleMappings = majorPentatonic;


// visual setup

const ellipseWidth = 0; // Width of the ellipses (track)
let centerY; // Center Y coordinate for the ellipses
let ellipses = []; // Array to store ellipses with their points
let isPlaying = false; // Control variable for play/stop
let playStopButton;
let speedSlider;
const minDistance = 5; // Minimum distance between points
let clickProximityX; // Maximum horizontal distance from the ellipse center to create a point
let ellipseHeight;
let clickProximityY; // Maximum vertical distance from the ellipse center to create a point
let pointSize; // square point

let buffer; // Declare a global variable for the graphics buffer
let textureBuffer; // Declare a global variable for the texture buffer
let textureY = 0; // Y position for the moving texture

function setup() {
  createCanvas(windowWidth, windowHeight);
  window.addEventListener('resize', resizeCanvasToWindow);
  frameRate(60);
    
  clearButton = createImg('images/bin_icon.jpg', '✖');
  clearButton.size(45, 45);
  clearButton.mousePressed(clearNotes);
  clearButton.position(windowWidth-50, 30);

  // Create the play/stop button
  playStopButton = createImg('images/play_icon.jpg', '▶');
  playStopButton.size(45, 45); 
  playStopButton.position(10, 30); 
  playStopButton.mousePressed(togglePlayStop);
  
  // dropdown menus for scales and instruments
  // Scale dropdown
  scalesDropdown = createSelect();
  
  // Add options
  scalesDropdown.option('Select a Scale:', ''); // This will be the heading

  scalesDropdown.option('--- Pentatonic ---');
  scalesDropdown.disable('--- Pentatonic ---');
  scalesDropdown.option('Major');
  scalesDropdown.option('Minor');

  scalesDropdown.option('--- Modal ---');
  scalesDropdown.disable('--- Modal ---');
  scalesDropdown.option('Ionian');
  scalesDropdown.option('Dorian');
  scalesDropdown.option('Mixolydian');
  scalesDropdown.option('Aeolian');
  
  scalesDropdown.option('--- Other ---');
  scalesDropdown.disable('--- Other ---');
  scalesDropdown.option('Chromatic');
  scalesDropdown.option('Harmonic Minor');
  scalesDropdown.option('Whole Tone');
  scalesDropdown.option('Octatonic');
  scalesDropdown.position(windowWidth/2, windowHeight - 25);

  // Set a callback function for when an option is selected
  scalesDropdown.changed(changeScale);
  
  // Instrument dropdown
  instrumentDropdown = createSelect();
  
  // Add options to the dropdown
  instrumentDropdown.option('Instrument:');
  instrumentDropdown.disable('Instrument:');
  instrumentDropdown.option('Comb');
  instrumentDropdown.option('Piano');
  instrumentDropdown.option('Harp');
  
  instrumentDropdown.position(10, windowHeight - 25);
  // Set a callback function for when an option is selected
  instrumentDropdown.changed(changeInstrument);  
  
  
  // create add and remove buttons for ellipses
  let addButton = createImg('images/plus_band.jpg', '+');
  addButton.size(45, 45);
  addButton.position(windowWidth - 55 - addButton.width, 30);
  addButton.mousePressed(() => {
    if (numEllipses < 15) {
    numEllipses++;
    initializePointsArray();
    }
  });

  let removeButton = createImg('images/minus_band.jpg', '-');
  removeButton.size(45, 45);
  removeButton.position(windowWidth - 60- removeButton.width - addButton.width, 30);
  removeButton.mousePressed(() => {
    if (numEllipses > 5) {
      numEllipses--;
      initializePointsArray();
    }
  });  

   // add metro symbol
  metroImage = createImg('images/metro_icon.jpg', 'tempo');
  metroImage.size(45, 45);
  metroImage.position(65, 30);
  
  // Create the speed slider
  let sliderWrapper = select('.slider-wrapper');
  speedSlider = createSlider(0.01, 0.03, 0.01, 0.001); // Min, Max, Default, Step
  speedSlider.position(65 + metroImage.width, 40);
  speedSlider.parent(sliderWrapper);
  speedSlider.style('width', '90px');
  
  // Initialize ellipses
  createEllipses();
  
  // Initialize barColors to default
  for (let i = 0; i < numEllipses; i++) {
    barColors[i] = color(0, 60);
  }  
  
  buffer = createGraphics(width, height);
  buffer.background(250);
  buffer.fill(180, 180, 180, 80); // Set fill color for the square
  buffer.noStroke(); // No stroke for the square
  buffer.rect(windowWidth*0.05, windowHeight*0.36, windowWidth *0.89, windowHeight*0.476, 10); // last argument is for rounded corners 
  
  // draw border around the sketch
  buffer.stroke(0, 50); // Set border color
  buffer.strokeWeight(3); // Set border weight
  buffer.noFill(); // Ensure the border is not filled
  buffer.rect(0, 0, windowWidth, windowHeight); // Draw border rect with same size as canvas 
  
  let rectWidth = windowWidth * 0.89;
  let rectHeight = windowHeight * 0.476;
  
  textureBuffer = createGraphics(rectWidth, rectHeight); // Create texture buffer matching the size of the central square
  let rectX = windowWidth * 0.05;
  let rectY = windowHeight * 0.36;
  textureBuffer.noStroke();
  
  initializePointsArray();
  
}

function draw() {
  background(255);
  image(buffer, 0, 0);
  
  // Define dimensions and position of the central square
  let rectX = windowWidth * 0.05;
  let rectY = windowHeight * 0.36;
  let rectWidth = windowWidth * 0.89;
  let rectHeight = windowHeight * 0.476;  
  
  centerY = rectY + rectHeight / 2; // Center Y position within the square

  // Define offsets for the bars
  let xBarOffset = 18; // Fixed increment in x direction
  let yBarOffset = 0;  // No increment in y direction

  // Update texture position
  if (isPlaying) {
    textureY -= speedSlider.value() * 140; // Move the texture up
    if (textureY <= -textureBuffer.height) {
      textureY += textureBuffer.height; // Reset the texture position
    }
  }

  // Draw the moving texture in the texture buffer
  textureBuffer.clear();
  textureBuffer.fill(0, 0, 0, 2);

  // Add horizontal lines to make the movement visible
  for (let y = textureY % 20; y < textureBuffer.height + 20; y += 20) {
    textureBuffer.rect(0, y, textureBuffer.width, 5);
  }

  // Draw the texture buffer within the central square
  push();
  translate(windowWidth * 0.05, windowHeight * 0.36);
  copy(textureBuffer, 0, 0, round(textureBuffer.width), round(textureBuffer.height), 0, 0, round(textureBuffer.width), round(textureBuffer.height));
  pop();

  // Calculate the initial spacing for ellipses
  let firstEllipseX = windowWidth * 0.12; // 10% of windowWidth
  let spacing = (windowWidth - firstEllipseX * 2) / (numEllipses - 1);
  
  // Update ellipses centerX
  for (let i = 0; i < numEllipses; i++) {
    let ellipseData = ellipses[i];
    ellipseData.centerX = firstEllipseX + spacing * i;
  }  
  
  // Draw transparent bars using ellipses' centerX values
  let bar_thickness = 6; // Adjust as needed
  for (let i = 0; i < numEllipses; i++) {
    stroke(barColors[i]); // Use barColors[i] for stroke
    strokeWeight(bar_thickness);
    let startX = ellipses[i].centerX;
    let startY = windowHeight * 0.335; // Fixed startY for bars
    let endX = startX;
    let endY = startY - windowHeight*0.15 + i*4.8; // Adjust the length as needed (negative for upward direction)
    line(startX, startY, endX, endY);
    
    // draw the clickable instrument buttons
    let buttonSize = 20; // Example size of the button
    let buttonX = startX;
    let buttonY = endY;
    ellipseButtons.push({ id: i, x: buttonX, y: buttonY, size: buttonSize });
    
    // Adjust color index using scaleMappings
    let originalIndex = scaleMappings[i];
    let colIndex = individualInstrumentArray[originalIndex] - 1;
    
    fill(ellipseColors[colIndex]); // ellipse color
    stroke(barColors[i]); // Stroke color same as bar color
    strokeWeight(0);
    
    // Draw the button (a circle)
    ellipse(buttonX, buttonY, buttonSize, buttonSize);         

    
  }  

  // Draw each ellipse and its points
  for (let i = 0; i < ellipses.length; i++) {
    let ellipseData = ellipses[i];
    ellipseData.centerX = firstEllipseX + spacing * i;
    ellipseData.centerY = centerY;

    // Draw the ellipse (track)
    noFill();
    noStroke();
    ellipse(ellipseData.centerX, centerY, ellipseWidth, ellipseHeight);
    
    pointSize = windowWidth * 0.4 / numEllipses;

    // Draw each point on the ellipse and increment their angles if playing
    for (let j = ellipseData.points.length - 1; j >= 0; j--) {
      let band_point = ellipseData.points[j];
      let { angle } = band_point;

      // Calculate point coordinates on ellipse based on angle
      let pointX = ellipseData.centerX + ellipseWidth / 2 * cos(angle);
      let pointY = centerY + ellipseHeight / 2 * sin(angle);

      // Calculate vertical size of the square with non-linear mapping (power function)
      let verticalSize = map(pow(abs(sin(angle)), 10), 0, 1, 5, 15);

      // Define the small adjustment
      let adjustment = -2.5;

      // Set transparency based on the angle
      let alpha;
      if (angle > HALF_PI + adjustment && angle < PI + HALF_PI - adjustment) {
        if (angle < PI) {
          // Gradually decrease transparency from (HALF_PI + adjustment) to PI
          alpha = map(angle, HALF_PI + adjustment, PI, -25, 255);
        } else {
          // Gradually increase transparency from PI to (PI + HALF_PI - adjustment)
          alpha = map(angle, PI, PI + HALF_PI - adjustment, 255, -25);
        }
      } else {
        alpha = 0;
      }
      fill(0, 0, 0, alpha); // Apply the calculated transparency

      // Draw the square on the ellipse
      rectMode(CENTER);
      noStroke();
      rect(pointX, pointY, pointSize, verticalSize); // 10 is the width of the square

      // Check if point has reached the top
      if (angle >= PI + PI / 2 && angle < PI + PI / 2 + speedSlider.value()) {
        let bufferIndex = scaleMappings[i];
        playSound(audioBuffers[bufferIndex]);
        flashBar(i); // visual bar flash for notes
      }

      // Increment the angle if playing
      if (isPlaying) {
        band_point.angle += speedSlider.value(); // Adjust the speed based on slider value
        band_point.angle %= TWO_PI; // Ensure the angle stays within 0 to 2*PI
      }
    }
  }
}

function togglePlayStop() {
  isPlaying = !isPlaying; // Toggle isPlaying flag

  // Update the image source based on isPlaying state
  if (isPlaying) {
    playStopButton.elt.src = 'images/pause_icon.jpg'; // Change to pause icon
  } else {
    playStopButton.elt.src = 'images/play_icon.jpg'; // Change to play icon
  }
}

function mousePressed() {
  if (preventNoteCreation) return;
  
  let buttonClicked = false;

  for (let btn of ellipseButtons) {
    let d = dist(mouseX, mouseY, btn.x, btn.y);
    if (d < btn.size / 2) {
      updateIndividualInstrumentArray(btn.id);
      buttonClicked = true;
    }
  }  

  // Determine which ellipse was clicked
  clickProximityX = windowWidth*0.25 / numEllipses // Minimum distance between points
  for (let i = 0; i < ellipses.length; i++) {
    let ellipseData = ellipses[i];
    let dXLeft = abs(mouseX - (ellipseData.centerX - clickProximityX));
    let dXRight = abs(mouseX - (ellipseData.centerX + clickProximityX));
    let dY = abs(mouseY - centerY);

    // Only create point if mouse is within clickProximity distance horizontally from the left side of the ellipse
    // and within clickProximityY vertically from the center of the ellipse

    if ((dXLeft <= clickProximityX || dXRight <= clickProximityX) && dY <= clickProximityY) {
      let newAngle = asin((mouseY - centerY) / (ellipseHeight / 2));

      // Ensure point is created on the left side
      newAngle = PI - newAngle;

      // Check distance from existing points in this ellipse
      let canAdd = true;
      for (let band_point of ellipseData.points) {
        let distance = abs(newAngle - band_point.angle);
        if (distance < minDistance * (PI / 180)) { // Convert minDistance from degrees to radians
          canAdd = false;
          break;
        }
      }

      if (canAdd) {
        ellipseData.points.push({ angle: newAngle });
        break;
      }
    }

    // Check if any existing point is clicked to remove it
    for (let j = ellipseData.points.length - 1; j >= 0; j--) {
      let band_point = ellipseData.points[j];
      let { angle } = band_point;

      // Calculate point coordinates on ellipse based on angle
      let pointX = ellipseData.centerX + ellipseWidth / 2 * cos(angle);
      let pointY = centerY + ellipseHeight / 2 * sin(angle);

      // Check if the mouse click is close to this point
      if (dist(mouseX, mouseY, pointX, pointY) <= pointSize / 2) {
        // Remove the point
        ellipseData.points.splice(j, 1);
        break; // Exit the loop after removing the point
      }
    }
  }
}

function touchStarted() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }    
  
  if (preventNoteCreation) return;
  if (touches.length > 0) {
    let touchX = touches[0].x;
    let touchY = touches[0].y;
  
    let buttonClicked = false;

    for (let btn of ellipseButtons) {
      let d = dist(mouseX, mouseY, btn.x, btn.y);
      if (d < btn.size / 1.8) {
        updateIndividualInstrumentArray(btn.id);
        buttonClicked = true;
      }
    }      

    // Determine which ellipse was touched
    clickProximityX = windowWidth*0.4 / numEllipses // Minimum distance between points
    for (let i = 0; i < ellipses.length; i++) {
      let ellipseData = ellipses[i];
      let dXLeft = abs(touchX - (ellipseData.centerX - clickProximityX));
      let dXRight = abs(touchX - (ellipseData.centerX + clickProximityX));
      let dY = abs(touchY - centerY);

      // Only create point if touch is within clickProximity distance horizontally from the left side of the ellipse
      // and within clickProximityY vertically from the center of the ellipse

      if ((dXLeft <= clickProximityX || dXRight <= clickProximityX) && dY <= clickProximityY) {
        let newAngle = asin((touchY - centerY) / (ellipseHeight / 2));

        // Ensure point is created on the left side
        newAngle = PI - newAngle;

        // Check distance from existing points in this ellipse
        let canAdd = true;
        for (let band_point of ellipseData.points) {
          let distance = abs(newAngle - band_point.angle);
          if (distance < minDistance * (PI / 180)) { // Convert minDistance from degrees to radians
            canAdd = false;
            break;
          }
        }

        if (canAdd) {
          ellipseData.points.push({ angle: newAngle });
          break;
        }
      }

      // Check if any existing point is touched to remove it
      for (let j = ellipseData.points.length - 1; j >= 0; j--) {
        let band_point = ellipseData.points[j];
        let { angle } = band_point;

        // Calculate point coordinates on ellipse based on angle
        let pointX = ellipseData.centerX + ellipseWidth / 2 * cos(angle);
        let pointY = centerY + ellipseHeight / 2 * sin(angle);

        // Check if the touch is close to this point
        if (dist(touchX, touchY, pointX, pointY) <= pointSize / 2) {
          // Remove the point
          ellipseData.points.splice(j, 1);
          break; // Exit the loop after removing the point
        }
      }
    }
  }
}


function playSound(buffer) {
  if (!isPlaying) return; // Failsafe: Do not play sound if not playing

  let source = audioContext.createBufferSource();
  source.buffer = buffer;
  let randomgain = (random(0, 10)) / 100;
  let gainNode = audioContext.createGain();
  gainNode.gain.value = 0.2 + randomgain; // volume multiplier
  source.connect(gainNode);
  gainNode.connect(audioContext.destination);
  source.start(0);
}

function flashBar(barIndex) {
  // Flash the bar for the selected barIndex
  barColors[barIndex] = color(255, 75); // White color
  // Reset the color back to default after a short delay
  setTimeout(() => {
    barColors[barIndex] = color(0, 60); // Default color
  }, 70); // Adjust the delay as needed
}

function clearNotes() {
  for (let i = 0; i < ellipses.length; i++) {
    ellipses[i].points = [];
  }
}

function resizeCanvasToWindow() {
  resizeCanvas(windowWidth, windowHeight);
  createEllipses();
  
  redraw();
}

function createEllipses() {
  let spacing = windowWidth *0.9 / numEllipses; // ellipse spacing distance
  ellipseHeight = windowHeight * 0.5; // Height of the ellipses (track)
  clickProximityY = ellipseHeight;
  for (let i = 0; i < numEllipses; i++) {
    ellipses.push({ centerX: spacing * i + spacing, points: [] });
  }
}

function initializePointsArray() {
  let newEllipses = [];
  let spacing = windowWidth * 0.9 / numEllipses; // Ellipse spacing distance
  ellipseHeight = windowHeight * 0.5; // Height of the ellipses (track)
  clickProximityY = ellipseHeight;

  for (let i = 0; i < numEllipses; i++) {
    // Initialize each ellipse with the existing points if available
    let existingPoints = (ellipses[i] && ellipses[i].points) ? ellipses[i].points : [];
    newEllipses.push({ centerX: spacing * i + spacing, points: existingPoints });
  }

  ellipses = newEllipses;
  // Initialize barColors to default
  barColors = [];
  for (let i = 0; i < numEllipses; i++) {
    barColors[i] = color(0, 60);
  }  
}

function changeScale() {
  // Handle the change in scale selection here
  let selectedScale = scalesDropdown.value();
  if (selectedScale !== 'disabled') {
    // Process selected scale
    if (selectedScale === 'Major') {// pentatonic
      scaleMappings = majorPentatonic;
    } 
    if (selectedScale === 'Minor') {// pentatonic
      scaleMappings = minorPentatonic;
    }     
    if (selectedScale === 'Ionian') {
      scaleMappings = ionian;
    }
    if (selectedScale === 'Dorian') {
      scaleMappings = dorian;
    }
    if (selectedScale === 'Mixolydian') {
      scaleMappings = mixolydian;
    }
    if (selectedScale === 'Aeolian') {
      scaleMappings = aeolian;
    }
    if (selectedScale === 'Chromatic') {
      scaleMappings = chromatic;
    }
    if (selectedScale === 'Harmonic Minor') {
      scaleMappings = harmonicMinor;
    }    
    if (selectedScale === 'Whole Tone') {
      scaleMappings = wholeTone;
    }
    if (selectedScale === 'Octatonic') {
      scaleMappings = octatonic;
    }
  }
}

function changeInstrument() {
  // Initialise new sample set here
  let selectedInstrument = instrumentDropdown.value();
  if (selectedInstrument !== 'disabled') {
    // Process selected scale
    
    if (selectedInstrument === 'Comb') {
      individualInstrumentArray = new Array(37).fill(1);
    }    
    
    if (selectedInstrument === 'Piano') {
      individualInstrumentArray = new Array(37).fill(2);
    }
    if (selectedInstrument === 'Harp') {
      individualInstrumentArray = new Array(37).fill(3);
    }
    console.log('Selected instrument:', selectedInstrument);
    
    loadAudioSet(individualInstrumentArray);
  }
}

function updateIndividualInstrumentArray(indexToUpdate) {
  // Clear previous debounce timer
  clearTimeout(debounceTimerArray);

  // Set a new debounce timer
  debounceTimerArray = setTimeout(() => {
    // Ensure indexToUpdate is within valid range
    if (indexToUpdate >= 0 && indexToUpdate < individualInstrumentArray.length) {
      
      // map the value according to scale dictionary
      indexToUpdate = scaleMappings[indexToUpdate];
      
      
      // Update the value at the specified indexToUpdate
      // Increment the value and constrain it to 1, 2, or 3
      individualInstrumentArray[indexToUpdate] = (individualInstrumentArray[indexToUpdate] % 3) + 1;
      
      // Reload audio set with updated individualInstrumentArray
      loadAudioSet(individualInstrumentArray);
    }
  }, 50); // Adjust debounce delay as needed (e.g., 50 milliseconds)
}

const button = document.getElementById("js-button");
const screenLabel = document.getElementById("screen");

const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");

// Establish a WebSocket connection to the ESP32
const socket = new WebSocket(`ws://192.168.55.243/ws`);

socket.onopen = function () {
  console.log("WebSocket connection established.");
  screenLabel.textContent = "WebSocket Connected";
};

socket.onclose = function () {
  console.log("WebSocket connection closed.");
  screenLabel.textContent = "WebSocket Disconnected";
};

// Function to send data over WebSocket
function sendToESP32(data) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));  // Send data as a JSON string
  } else {
    console.error("WebSocket is not open.");
  }
}

// Button click event handler
button.addEventListener("click", function (event) {
  let outerWrapper = event.target.closest(".button-inner-wrapper");

  if (outerWrapper.classList.contains("turn-on")) {
    outerWrapper.classList.remove("turn-on");
    document.body.classList.remove("active");
    screenLabel.textContent = "TURNING OFF WiFi";

    // Send data to ESP32 when Bluetooth is turned off
    sendToESP32({ type: "WiFi", status: "off" });
  } else {
    outerWrapper.classList.add("turn-on");
    document.body.classList.add("active");
    screenLabel.textContent = "TURNING ON WiFi";

    // Send data to ESP32 when Bluetooth is turned on
    sendToESP32({ type: "WiFi", status: "on" });
  }
});

// Start button event handler
startButton.addEventListener("click", function () {
  document.body.classList.add("active");
  screenLabel.textContent = "PS4 ON";

  // Send data to ESP32 when PS4 is turned on
  sendToESP32({ type: "ps4", status: "on" });
});

// Stop button event handler
stopButton.addEventListener("click", function () {
  document.body.classList.remove("active");
  screenLabel.textContent = "PS4 OFF";

  // Send data to ESP32 when PS4 is turned off
  sendToESP32({ type: "ps4", status: "off" });
});


// // WebSocket connection setup
// let socket = new WebSocket('ws://<ESP32_IP_ADDRESS>:<PORT>');

// // WebSocket event listeners
// socket.onopen = function() {
//     console.log('Connected to ESP32 WebSocket');
// };

// socket.onclose = function() {
//     console.log('Disconnected from ESP32 WebSocket');
// };

// socket.onerror = function(error) {
//     console.error('WebSocket Error: ', error);
// };

function sendToArduino(data) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
    } else {
        console.error('WebSocket connection not open');
    }
}

// // Canvas setup for the left joystick
// // Joystick Implementation
// // WebSocket connection setup
// let socket = new WebSocket('ws://<ESP32_IP_ADDRESS>:<PORT>');

// // WebSocket event listeners
// socket.onopen = function() {
//     console.log('Connected to ESP32 WebSocket');
// };

// socket.onclose = function() {
//     console.log('Disconnected from ESP32 WebSocket');
// };

// socket.onerror = function(error) {
//     console.error('WebSocket Error: ', error);
// };

// function sendToArduino(data) {
//     if (socket.readyState === WebSocket.OPEN) {
//         socket.send(JSON.stringify(data));
//     } else {
//         console.error('WebSocket connection not open');
//     }
// }

// Canvas setup for the left joystick
const canvas = document.getElementById('joystickCanvas');
const ctx = canvas.getContext('2d');

let isDragging = false;
const joystickRadius = 15;
const canvasRadius = canvas.width / 2;

let joystickX = canvasRadius;
let joystickY = canvasRadius;

function drawJoystick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(joystickX, joystickY, joystickRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
}

function updateCoordinates(x, y) {
    // Calculate the deltaX and deltaY from the center
    const deltaX = x - canvasRadius;
    const deltaY = y - canvasRadius;

    // Calculate the maximum allowed distance (radius of the joystick movement area)
    const maxDistance = canvasRadius - joystickRadius;

    // Calculate the length of the vector from the center
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Normalize the distance and constrain it to the joystick radius
    const constrainedDistance = Math.min(distance, maxDistance);

    // Calculate normalized coordinates (-127 to 127)
    const normalizedX = Math.round((constrainedDistance > 0 ? (deltaX / maxDistance) * 127 : 0));
    const normalizedY = Math.round((constrainedDistance > 0 ? (deltaY / maxDistance) * 127 : 0));

    // Update screen label for debugging
    screenLabel.textContent = `Left Stick - X: ${normalizedX}, Y: ${normalizedY}`;

    // Send data to Arduino
    sendToArduino({ type: 'joystick', x: normalizedX, y: normalizedY });
}

function handleMouseDown(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const dist = Math.sqrt(Math.pow(mouseX - joystickX, 2) + Math.pow(mouseY - joystickY, 2));

    if (dist <= joystickRadius) {
        isDragging = true;
    }
}

function handleMouseMove(event) {
    if (!isDragging) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const deltaX = mouseX - canvasRadius;
    const deltaY = mouseY - canvasRadius;

    const angle = Math.atan2(deltaY, deltaX);

    const dist = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), canvasRadius - joystickRadius);

    joystickX = canvasRadius + dist * Math.cos(angle);
    joystickY = canvasRadius + dist * Math.sin(angle);

    drawJoystick();
    updateCoordinates(joystickX, joystickY);
}

function handleMouseUp() {
    isDragging = false;
    joystickX = canvasRadius;
    joystickY = canvasRadius;

    drawJoystick();
    updateCoordinates(joystickX, joystickY);
}

canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);

canvas.addEventListener('touchstart', handleMouseDown);
canvas.addEventListener('touchmove', event => {
    event.preventDefault();
    handleMouseMove(event.touches[0]);
});
canvas.addEventListener('touchend', handleMouseUp);

// Initial drawing
drawJoystick();
updateCoordinates(joystickX, joystickY);

// Right Stick Joystick Implementation
const canvasRight = document.getElementById('joystickCanvasRight');
const ctxRight = canvasRight.getContext('2d');

let isDraggingRight = false;
const joystickRadiusRight = 15;
const canvasRadiusRight = canvasRight.width / 2;

let joystickXRight = canvasRadiusRight;
let joystickYRight = canvasRadiusRight;

function drawJoystickRight() {
    ctxRight.clearRect(0, 0, canvasRight.width, canvasRight.height);
    ctxRight.beginPath();
    ctxRight.arc(joystickXRight, joystickYRight, joystickRadiusRight, 0, Math.PI * 2);
    ctxRight.fillStyle = 'white';
    ctxRight.fill();
    ctxRight.closePath();
}

function updateCoordinatesRight(x, y) {
    // Calculate the deltaX and deltaY from the center
    const deltaX = x - canvasRadiusRight;
    const deltaY = y - canvasRadiusRight;

    // Calculate the maximum allowed distance (radius of the joystick movement area)
    const maxDistance = canvasRadiusRight - joystickRadiusRight;

    // Calculate the length of the vector from the center
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Normalize the distance and constrain it to the joystick radius
    const constrainedDistance = Math.min(distance, maxDistance);

    // Calculate normalized coordinates (-127 to 127)
    const normalizedX = Math.round((constrainedDistance > 0 ? (deltaX / maxDistance) * 127 : 0));
    const normalizedY = Math.round((constrainedDistance > 0 ? (deltaY / maxDistance) * 127 : 0));

    // Update screen label for debugging
    screenLabel.textContent = `Right Stick - X: ${normalizedX}, Y: ${normalizedY}`;

    // Send data to Arduino
    sendToArduino({ type: 'joystick_right', x: normalizedX, y: normalizedY });
}

function handleMouseDownRight(event) {
    const rect = canvasRight.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const dist = Math.sqrt(Math.pow(mouseX - joystickXRight, 2) + Math.pow(mouseY - joystickYRight, 2));

    if (dist <= joystickRadiusRight) {
        isDraggingRight = true;
    }
}

function handleMouseMoveRight(event) {
    if (!isDraggingRight) return;

    const rect = canvasRight.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const deltaX = mouseX - canvasRadiusRight;
    const deltaY = mouseY - canvasRadiusRight;

    const angle = Math.atan2(deltaY, deltaX);

    const dist = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), canvasRadiusRight - joystickRadiusRight);

    joystickXRight = canvasRadiusRight + dist * Math.cos(angle);
    joystickYRight = canvasRadiusRight + dist * Math.sin(angle);

    drawJoystickRight();
    updateCoordinatesRight(joystickXRight, joystickYRight);
}

function handleMouseUpRight() {
    isDraggingRight = false;
    joystickXRight = canvasRadiusRight;
    joystickYRight = canvasRadiusRight;

    drawJoystickRight();
    updateCoordinatesRight(joystickXRight, joystickYRight);
}

canvasRight.addEventListener('mousedown', handleMouseDownRight);
canvasRight.addEventListener('mousemove', handleMouseMoveRight);
canvasRight.addEventListener('mouseup', handleMouseUpRight);

canvasRight.addEventListener('touchstart', handleMouseDownRight);
canvasRight.addEventListener('touchmove', event => {
    event.preventDefault();
    handleMouseMoveRight(event.touches[0]);
});
canvasRight.addEventListener('touchend', handleMouseUpRight);

// Initial drawing
drawJoystickRight();
updateCoordinatesRight(joystickXRight, joystickYRight);

 // Attach event listeners to all D-pad buttons by their ids
document.getElementById('dpad-up').addEventListener('click', () => sendDpadCommand('up'));
document.getElementById('dpad-right').addEventListener('click', () => sendDpadCommand('right'));
document.getElementById('dpad-down').addEventListener('click', () => sendDpadCommand('down'));
document.getElementById('dpad-left').addEventListener('click', () => sendDpadCommand('left'));

function sendDpadCommand(direction) {
    const command = JSON.stringify({ type: 'dpad', direction: direction });
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(command);
        console.log("D-pad command sent:", direction);
    } else {
        console.error("WebSocket connection is not open");
    }
}


  // // Handle button clicks
  // document.getElementById('dpad-up').addEventListener('click', () => sendDpadCommand('up'));
  // document.getElementById('dpad-right').addEventListener('click', () => sendDpadCommand('right'));
  // document.getElementById('dpad-down').addEventListener('click', () => sendDpadCommand('down'));
  // document.getElementById('dpad-left').addEventListener('click', () => sendDpadCommand('left'));

  // function sendDpadCommand(direction) {
  //     const command = JSON.stringify({ type: 'dpad', direction: direction });
  //     socket.send(command);
  
  // document.getElementById('dpad-start').addEventListener('click', () => sendButtonCommand('X'));
  // document.getElementById('dpad-stop').addEventListener('click', () => sendButtonCommand('Circle'));
  // document.getElementById('triangle-button').addEventListener('click', () => sendButtonCommand('Triangle'));
  // document.getElementById('square-button').addEventListener('click', () => sendButtonCommand('Square'));
  
  // function sendButtonCommand(buttonName) {
  //   const command = JSON.stringify({ type: 'button', value: buttonName });
  //   socket.send(command); // Send command through WebSocket
  // }
  // Attach event listeners to all additional buttons
document.querySelectorAll('.dpad-button').forEach(button => {
  button.addEventListener('click', (event) => {
      const buttonId = event.target.id;
      let command;

      if (buttonId === "dpad-start") {
          command = { type: 'control', action: 'start' };
      } else if (buttonId === "dpad-stop") {
          command = { type: 'control', action: 'stop' };
      } else if (buttonId === "dpad-triangle") {
          command = { type: 'control', action: 'triangle' };
      } else if (buttonId === "dpad-square") {
          command = { type: 'control', action: 'square' };
      }

      if (command) {
          const jsonCommand = JSON.stringify(command);
          if (socket.readyState === WebSocket.OPEN) {
              socket.send(jsonCommand);
              console.log("Button command sent:", command);
          } else {
              console.error("WebSocket connection is not open");
          }
      }
  });
});

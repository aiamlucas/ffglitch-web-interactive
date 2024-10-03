// //server/index.js
const express = require("express");
const https = require("https");
const fs = require("fs");
const { Server } = require("socket.io");
const cors = require("cors");
const zmq = require("zeromq");
const app = express();

app.use(cors());

const zmqAddress = "tcp://localhost:4646";

// Load the self-signed certificate and private key
const server = https.createServer({
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.cert"),
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Generate dictionaries for faders and pans
const generateItemsDictionary = (numItems, prefix) => {
  return Array.from({ length: numItems }, (_, i) => ({
    name: `${prefix}${i + 1}`,
    value: 0,
  }));
};

const FadersDictionary = generateItemsDictionary(3, "fader");
// const PansDictionary = generateItemsDictionary(2, "pan"); // Desktop needs pans... and it still in development

const generateToggleValues = (numButtons) => {
  const toggles = {};
  for (let i = 1; i <= numButtons; i++) {
    toggles[`button${i}`] = 0;
  }
  return toggles;
};

const toggleValues = generateToggleValues(15); // 15 buttons -// Desktop needs more buttons... and it still in development

let nb_frames = 1;
let x = 0; // Initialize x axis for Desktop
let y = 0; // Initialize y axis for Desktop
let mobileX = 0; // Mobile x axis
let mobileY = 0; // Mobile y axis

// Set up ZeroMQ
async function setupZmq() {
  const zmqSocket = new zmq.Push();
  await zmqSocket.connect(zmqAddress);
  return zmqSocket;
}

let zmqSocket;

setupZmq().then((socket) => {
  zmqSocket = socket;
});

// Handle connections from clients (Desktop and Mobile)
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Send the current fader and toggle values to the Desktop client upon connection
  socket.emit("initial_fader_values", FadersDictionary);
  socket.emit("initial_toggle_values", toggleValues);
  // socket.emit("initial_pan_values", PansDictionary); // Desktop needs pans... and it still in development

  // Handling broadcast of log messages to all clients
  socket.on("broadcast_log", (logMessage) => {
    io.emit("receive_log", logMessage); // Broadcast the log message to all clients
  });

  // Handling messages from the Desktop (faders, pans, chat)
  socket.on("send_message", (data) => {
    const { fader, message, username, chatMessage } = data;

    if (fader && message !== undefined) {
      const index = FadersDictionary.findIndex((param) => param.name === fader);

      if (index !== -1) {
        FadersDictionary[index].value = message;

        console.log(
          "Fader value changed:",
          fader,
          FadersDictionary[index].value
        );

        // Broadcast the updated fader values to all connected clients
        io.emit("updated_fader_values", FadersDictionary);

        // Update nb_frames based on fader2 value
        if (fader === "fader1") {
          nb_frames = message;
          console.log("nb_frames updated to:", nb_frames);
        }
      }
    } else {
      const panIndex = PansDictionary.findIndex(
        (param) => param.name === fader
      );
      if (panIndex !== -1) {
        PansDictionary[panIndex].value = message;

        console.log(
          "Pan value changed:",
          fader,
          PansDictionary[panIndex].value
        );

        // Broadcast the updated pan values to all connected clients
        io.emit("updated_pan_values", PansDictionary);
      }
    }
  });

  // Handling toggle values (Desktop and Mobile)
  socket.on("send_toggle_value", (data) => {
    const { toggle } = data;

    if (toggleValues.hasOwnProperty(toggle)) {
      toggleValues[toggle] = toggleValues[toggle] === 0 ? 1 : 0;
      console.log("Toggle value changed:", toggle, toggleValues[toggle]);

      // Broadcast the updated toggle values to all connected clients
      io.emit("updated_toggle_values", toggleValues);

      if (toggle === "button1") {
        const msg = JSON.stringify({
          "cleaner.mb_type": nb_frames,
          "cleaner.reset_mb_type": 1,
          "cleaner.pict_type": nb_frames,
          "cleaner.reset_pict_type": 1,
        });
        console.log(msg);
        zmqSocket.send(msg);
        console.log("Sent Clear Glitch message via ZeroMQ:", msg);
      }
    }
  });

  // Update the ball position and send via ZeroMQ
  socket.on("ball_position_update", (newPosition) => {
    // Broadcast the new position to all other clients except the sender
    socket.broadcast.emit("ball_position_update", newPosition);

    console.log(`Received ball position from ${socket.id}:`, newPosition);

    // Scale the x and y values to the range -100 to 100
    x = Math.round(newPosition.x / 2);
    y = Math.round(newPosition.y / 2);

    // Ensure the values are clamped within -100 to 100
    x = Math.max(-100, Math.min(100, x));
    y = Math.max(-100, Math.min(100, y));

    // Send the position via ZeroMQ
    sendDesktopXandY();
  });

  // Mobile Event: Handle Clear Glitch event
  socket.on("clear_glitch", () => {
    console.log("Received Clear Glitch from Mobile");

    const msg = JSON.stringify({
      "cleaner.mb_type": nb_frames,
      "cleaner.reset_mb_type": 1,
      "cleaner.pict_type": nb_frames,
      "cleaner.reset_pict_type": 1,
    });

    zmqSocket.send(msg);
    console.log("Sent Clear Glitch message via ZeroMQ from Mobile:", msg);
  });

  // Mobile Event: Handle x/y coordinates from mobile
  socket.on("send_coordinates", (data) => {
    const { x, y } = data;
    mobileX = x;
    mobileY = y;

    console.log(`Received Mobile x: ${mobileX}, y: ${mobileY}`);

    // Send x/y to ZeroMQ or any other processing logic
    sendMobileXandY(mobileX, mobileY);
  });
});

// Function to send Desktop x and y values via ZeroMQ
async function sendDesktopXandY() {
  const msg = JSON.stringify({
    "mv_pan.mv": [x, y], // Send Desktop x and y values as motion vectors
  });

  try {
    await zmqSocket.send(msg); // Use async/await to ensure send finishes before proceeding
    console.log("Sent Desktop x and y via ZeroMQ:", msg);
  } catch (error) {
    console.error("Error sending Desktop x and y:", error);
  }
}

// Listen on all available network interfaces
server.listen(3001, "0.0.0.0", () => {
  console.log("Server is running on https://0.0.0.0:3001");
});

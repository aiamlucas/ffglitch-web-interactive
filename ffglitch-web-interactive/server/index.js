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
  key: fs.readFileSync("server.key"), // Path to your private key
  cert: fs.readFileSync("server.cert"), // Path to your self-signed certificate
});

const io = new Server(server, {
  cors: {
    origin: "*", // Replace with your client address
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

const FadersDictionary = generateItemsDictionary(25, "fader");
const PansDictionary = generateItemsDictionary(2, "pan");

// Function to dynamically create toggleValues object
const generateToggleValues = (numButtons) => {
  const toggles = {};
  for (let i = 1; i <= numButtons; i++) {
    toggles[`button${i}`] = 0;
  }
  return toggles;
};

const toggleValues = generateToggleValues(15); // Dynamically create 15 buttons

let nb_frames = 1; // Initial number of frames
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
  socket.emit("initial_pan_values", PansDictionary);

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
        if (fader === "fader2") {
          nb_frames = Math.round(message * 100);
          console.log("nb_frames updated to:", nb_frames);
        } else if (fader === "fader4") {
          x = Math.round(message * 100); // Set x based on fader4 for Desktop
          console.log("Desktop x axis updated to:", x);
          sendDesktopXandY(); // Send x and y values via ZeroMQ
        } else if (fader === "fader5") {
          y = Math.round(message * 100); // Set y based on fader5 for Desktop
          console.log("Desktop y axis updated to:", y);
          sendDesktopXandY(); // Send x and y values via ZeroMQ
        }
      }
    } else if (chatMessage && username) {
      console.log(`Received chat message from ${username}:`, chatMessage);
      io.emit("receive_message", { username, chatMessage });
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

      // Example for sending a Clear Glitch message when a toggle is activated (like button4)
      if (toggle === "button4") {
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
function sendDesktopXandY() {
  const msg = JSON.stringify({
    "mv_pan.mv": [x, y], // Send Desktop x and y values as motion vectors
  });
  zmqSocket.send(msg);
  console.log("Sent Desktop x and y via ZeroMQ:", msg);
}

// Function to send Mobile x and y values via ZeroMQ
function sendMobileXandY(xValue, yValue) {
  const msg = JSON.stringify({
    "mv_pan.mv_mobile": [xValue, yValue], // Send Mobile x and y values as motion vectors
  });
  zmqSocket.send(msg);
  console.log("Sent Mobile x and y via ZeroMQ:", msg);
}

// Listen on HTTPS
server.listen(3001, () => {
  console.log("Server is running on https://localhost:3001");
});

// // // ______________________________________________________
// // // ______________________________________________________

// //server/index.js
// const express = require("express");
// const https = require("https");
// const fs = require("fs");
// const { Server } = require("socket.io");
// const cors = require("cors");
// const zmq = require("zeromq");
// const app = express();

// app.use(cors());

// const zmqAddress = "tcp://localhost:4646";

// // Load the self-signed certificate and private key
// const server = https.createServer({
//   key: fs.readFileSync("server.key"), // Path to your private key
//   cert: fs.readFileSync("server.cert"), // Path to your self-signed certificate
// });

// const io = new Server(server, {
//   cors: {
//     origin: "*", // Replace this with your client address
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// // OLD Connecting with the URL from the frontend (localhost:3000) with WebSockets over HTTPS
// // const io = new Server(server, {
// //   cors: {
// //     origin: "*",
// //     methods: ["GET", "POST"],
// //   },
// // });

// // Generate dictionaries for faders and pans
// const generateItemsDictionary = (numItems, prefix) => {
//   return Array.from({ length: numItems }, (_, i) => ({
//     name: `${prefix}${i + 1}`,
//     value: 0,
//   }));
// };

// const FadersDictionary = generateItemsDictionary(25, "fader");
// const PansDictionary = generateItemsDictionary(2, "pan");

// // Function to dynamically create toggleValues object
// const generateToggleValues = (numButtons) => {
//   const toggles = {};
//   for (let i = 1; i <= numButtons; i++) {
//     toggles[`button${i}`] = 0;
//   }
//   return toggles;
// };

// const toggleValues = generateToggleValues(15); // Dynamically create 15 buttons

// let nb_frames = 1; // Initial number of frames
// let x = 0; // Initialize x axis
// let y = 0; // Initialize y axis

// // Set up ZeroMQ
// async function setupZmq() {
//   const zmqSocket = new zmq.Push();
//   await zmqSocket.connect(zmqAddress);
//   return zmqSocket;
// }

// let zmqSocket;

// setupZmq().then((socket) => {
//   zmqSocket = socket;
// });

// io.on("connection", (socket) => {
//   console.log(`User Connected: ${socket.id}`);

//   // Send the current fader and toggle values to the client upon connection
//   socket.emit("initial_fader_values", FadersDictionary);
//   socket.emit("initial_toggle_values", toggleValues);
//   socket.emit("initial_pan_values", PansDictionary);

//   socket.on("send_message", (data) => {
//     const { fader, message, username, chatMessage } = data;

//     if (fader && message !== undefined) {
//       const index = FadersDictionary.findIndex((param) => param.name === fader);

//       if (index !== -1) {
//         FadersDictionary[index].value = message;

//         console.log(
//           "Fader value changed:",
//           fader,
//           FadersDictionary[index].value
//         );

//         // Broadcast the updated fader values to all connected clients
//         io.emit("updated_fader_values", FadersDictionary);

//         // Update nb_frames based on fader2 value
//         if (fader === "fader2") {
//           nb_frames = Math.round(message * 100);
//           console.log("nb_frames updated to:", nb_frames);
//         } else if (fader === "fader4") {
//           x = Math.round(message * 100); // Set x based on fader4
//           console.log("x axis updated to:", x);
//           sendXandY(); // Send x and y values via ZeroMQ
//         } else if (fader === "fader5") {
//           y = Math.round(message * 100); // Set y based on fader5
//           console.log("y axis updated to:", y);
//           sendXandY(); // Send x and y values via ZeroMQ
//         }
//       }
//     } else if (chatMessage && username) {
//       console.log(`Received chat message from ${username}:`, chatMessage);
//       io.emit("receive_message", { username, chatMessage });
//     } else {
//       const panIndex = PansDictionary.findIndex(
//         (param) => param.name === fader
//       );
//       if (panIndex !== -1) {
//         PansDictionary[panIndex].value = message;

//         console.log(
//           "Pan value changed:",
//           fader,
//           PansDictionary[panIndex].value
//         );

//         // Broadcast the updated pan values to all connected clients
//         io.emit("updated_pan_values", PansDictionary);
//       }
//     }
//   });

//   socket.on("send_toggle_value", (data) => {
//     const { toggle } = data;

//     if (toggleValues.hasOwnProperty(toggle)) {
//       toggleValues[toggle] = toggleValues[toggle] === 0 ? 1 : 0;
//       console.log("Toggle value changed:", toggle, toggleValues[toggle]);

//       // Broadcast the updated toggle values to all connected clients
//       io.emit("updated_toggle_values", toggleValues);

//       if (toggle === "button4") {
//         const msg = JSON.stringify({
//           "cleaner.mb_type": nb_frames,
//           "cleaner.reset_mb_type": 1,
//           "cleaner.pict_type": nb_frames,
//           "cleaner.reset_pict_type": 1,
//         });
//         console.log(msg);
//         zmqSocket.send(msg);
//         console.log("Sent message via ZeroMQ:", msg);
//       }
//     }
//   });

//   socket.on("send_message", (data) => {
//     const { x, y } = data;

//     if (typeof data.x === "number" && typeof data.y === "number") {
//       console.log("Mouse Coordinates:", x, y);
//     }
//   });
// });

// // Function to send x and y values via ZeroMQ
// function sendXandY() {
//   const msg = JSON.stringify({
//     "mv_pan.mv": [x, y], // Send x and y values as motion vectors
//   });
//   zmqSocket.send(msg);
//   console.log("Sent x and y via ZeroMQ:", msg);
// }

// // Listen on HTTPS instead of HTTP
// server.listen(3001, () => {
//   console.log("Server is running on https://localhost:3001");
// });

// ______________________________________________________
// ______________________________________________________

// const express = require("express");
// const app = express();
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");
// const zmq = require("zeromq");
// app.use(cors());

// // fader2 => nb_frames

// const server = http.createServer(app);
// const zmqAddress = "tcp://localhost:4646";

// // Connecting with the URL from the frontend (localhost:3000)
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// // Generate dictionaries for faders and pans
// const generateItemsDictionary = (numItems, prefix) => {
//   return Array.from({ length: numItems }, (_, i) => ({
//     name: `${prefix}${i + 1}`,
//     value: 0,
//   }));
// };

// const FadersDictionary = generateItemsDictionary(25, "fader");
// const PansDictionary = generateItemsDictionary(2, "pan");

// // Function to dynamically create toggleValues object
// const generateToggleValues = (numButtons) => {
//   const toggles = {};
//   for (let i = 1; i <= numButtons; i++) {
//     toggles[`button${i}`] = 0;
//   }
//   return toggles;
// };

// const toggleValues = generateToggleValues(15); // Dynamically create 15 buttons

// let nb_frames = 1; // Initial number of frames
// let x = 0; // Initialize x axis
// let y = 0; // Initialize y axis

// // Set up ZeroMQ
// async function setupZmq() {
//   const zmqSocket = new zmq.Push();
//   await zmqSocket.connect(zmqAddress);
//   return zmqSocket;
// }

// let zmqSocket;

// setupZmq().then((socket) => {
//   zmqSocket = socket;
// });

// io.on("connection", (socket) => {
//   console.log(`User Connected: ${socket.id}`);

//   // Send the current fader and toggle values to the client upon connection
//   socket.emit("initial_fader_values", FadersDictionary);
//   socket.emit("initial_toggle_values", toggleValues);
//   socket.emit("initial_pan_values", PansDictionary);

//   socket.on("send_message", (data) => {
//     const { fader, message, username, chatMessage } = data;

//     if (fader && message !== undefined) {
//       const index = FadersDictionary.findIndex((param) => param.name === fader);

//       if (index !== -1) {
//         FadersDictionary[index].value = message;

//         console.log(
//           "Fader value changed:",
//           fader,
//           FadersDictionary[index].value
//         );

//         // Broadcast the updated fader values to all connected clients
//         io.emit("updated_fader_values", FadersDictionary);

//         // Update nb_frames based on fader2 value
//         if (fader === "fader2") {
//           nb_frames = Math.round(message * 100);
//           console.log("nb_frames updated to:", nb_frames);

//           // If needed, send the new nb_frames value via ZeroMQ
//         } else if (fader === "fader4") {
//           x = Math.round(message * 100); // Set x based on fader4
//           console.log("x axis updated to:", x);
//           sendXandY(); // Send x and y values via ZeroMQ
//         } else if (fader === "fader5") {
//           y = Math.round(message * 100); // Set y based on fader5
//           console.log("y axis updated to:", y);
//           sendXandY(); // Send x and y values via ZeroMQ
//         }
//       }
//     } else if (chatMessage && username) {
//       console.log(`Received chat message from ${username}:`, chatMessage);
//       io.emit("receive_message", { username, chatMessage });
//     } else {
//       const panIndex = PansDictionary.findIndex(
//         (param) => param.name === fader
//       );
//       if (panIndex !== -1) {
//         PansDictionary[panIndex].value = message;

//         console.log(
//           "Pan value changed:",
//           fader,
//           PansDictionary[panIndex].value
//         );

//         // Broadcast the updated pan values to all connected clients
//         io.emit("updated_pan_values", PansDictionary);
//       }
//     }
//   });

//   socket.on("send_toggle_value", (data) => {
//     const { toggle } = data;

//     if (toggleValues.hasOwnProperty(toggle)) {
//       toggleValues[toggle] = toggleValues[toggle] === 0 ? 1 : 0;
//       console.log("Toggle value changed:", toggle, toggleValues[toggle]);

//       // Broadcast the updated toggle values to all connected clients
//       io.emit("updated_toggle_values", toggleValues);

//       if (toggle === "button4") {
//         const msg = JSON.stringify({
//           "cleaner.mb_type": nb_frames,
//           "cleaner.reset_mb_type": 1,
//           "cleaner.pict_type": nb_frames,
//           "cleaner.reset_pict_type": 1,
//         });
//         console.log(msg);
//         zmqSocket.send(msg);
//         console.log("Sent message via ZeroMQ:", msg);
//       }
//     }
//   });

//   socket.on("send_message", (data) => {
//     const { x, y } = data;

//     if (typeof data.x === "number" && typeof data.y === "number") {
//       console.log("Mouse Coordinates:", x, y);
//     }
//   });
// });

// // Function to send x and y values via ZeroMQ
// function sendXandY() {
//   const msg = JSON.stringify({
//     "mv_pan.mv": [x, y], // Send x and y values as motion vectors
//   });
//   zmqSocket.send(msg);
//   console.log("Sent x and y via ZeroMQ:", msg);
// }

// server.listen(3001, () => {
//   console.log("Server is running...");
// });

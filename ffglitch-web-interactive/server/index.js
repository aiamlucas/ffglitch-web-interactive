const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const OSC = require("osc-js");
const zmq = require("zeromq");

app.use(cors());
const osc = new OSC({
  plugin: new OSC.DatagramPlugin({ send: { port: 57120 } }),
}); // Set the port to 57120 for sending OSC messages

const server = http.createServer(app);

// connecting with the URL from the frontend (localhost:3000)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
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

// let FadersDictionary = [
//   { name: "fader1", value: 0 },
//   { name: "fader2", value: 0 },
//   { name: "fader3", value: 0 },
//   { name: "fader4", value: 0 },
//   { name: "fader5", value: 0 },
//   { name: "fader6", value: 0 },
//   { name: "fader7", value: 0 },
//   { name: "fader8", value: 0 },
//   { name: "fader9", value: 0 },
//   { name: "fader10", value: 0 },
//   { name: "fader11", value: 0 },
//   { name: "fader12", value: 0 },
//   { name: "fader13", value: 0 },
//   { name: "fader14", value: 0 },
//   { name: "fader15", value: 0 },
//   { name: "fader16", value: 0 },
//   { name: "fader17", value: 0 },
//   { name: "fader18", value: 0 },
//   { name: "fader19", value: 0 },
//   { name: "fader20", value: 0 },
//   { name: "fader21", value: 0 },
//   { name: "fader22", value: 0 },
//   { name: "fader23", value: 0 },
//   { name: "fader24", value: 0 },
//   { name: "fader25", value: 0 },
// ];

// const faderValues = Array(FadersDictionary.length).fill(0);

let toggleValues = {
  button1: 0,
  button2: 0,
  button3: 0,
  button4: 0,
  button5: 0,
  button6: 0,
  button7: 0,
  button8: 0,
  button9: 0,
  button10: 0,
  button11: 0,
  button12: 0,
  button13: 0,
  button14: 0,
  button15: 0,
};

// Set up ZeroMQ
async function setupZmq() {
  const zmqSocket = new zmq.Push();
  await zmqSocket.connect("tcp://192.168.178.81:5555");
  return zmqSocket;
}

let zmqSocket;

setupZmq().then((socket) => {
  zmqSocket = socket;
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Send the current fader and toggle values to the client upon connection
  socket.emit("initial_fader_values", FadersDictionary);
  socket.emit("initial_toggle_values", toggleValues);
  socket.emit("initial_pan_values", PansDictionary);

  socket.on("send_message", (data) => {
    const { fader, message } = data;

    const index = FadersDictionary.findIndex((param) => param.name === fader);

    if (index !== -1 && typeof message === "number") {
      FadersDictionary[index].value = message;

      console.log("Fader value changed:", fader, FadersDictionary[index].value);

      // Broadcast the updated fader values to all connected clients
      io.emit("updated_fader_values", FadersDictionary);

      // Send the OSC message
      let oscAddress = `${fader}I`;
      let oscValue = message;
      let oscMessage = new OSC.Message(oscAddress, oscValue);
      osc.send(oscMessage);

      // Send message via ZeroMQ for specific faders
      if (fader === "fader1") {
        const msg = JSON.stringify({ cmd: "pan", x: message, y: message });
        zmqSocket.send(msg);
        console.log("Sent message via ZeroMQ:", msg);
      }
    } else {
      const panIndex = PansDictionary.findIndex(
        (param) => param.name === fader
      );
      if (panIndex !== -1 && typeof message === "number") {
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

  socket.on("send_toggle_value", (data) => {
    const { toggle } = data;

    if (toggleValues.hasOwnProperty(toggle)) {
      toggleValues[toggle] = toggleValues[toggle] === 0 ? 1 : 0;
      console.log("Toggle value changed:", toggle, toggleValues[toggle]);

      // Broadcast the updated toggle values to all connected clients
      io.emit("updated_toggle_values", toggleValues);

      // Send the OSC message
      let oscAddress = `${toggle}I`;
      let oscValue = toggleValues[toggle];
      let oscMessage = new OSC.Message(oscAddress, oscValue);
      osc.send(oscMessage);

      // Send message via ZeroMQ when button1 is toggled
      if (toggle === "button1") {
        const msg = JSON.stringify({ cmd: "keyframe" });
        zmqSocket.send(msg);
        console.log("Sent message via ZeroMQ:", msg);
      }

      // Send message via ZeroMQ when button1 is toggled
      if (toggle === "button2") {
        const msg = JSON.stringify({ cmd: "clean_frame" });
        zmqSocket.send(msg);
        console.log("Sent message via ZeroMQ:", msg);
      }
    }
  });

  socket.on("send_message", (data) => {
    const { message, asciiMessage } = data;

    if (typeof message === "string") {
      console.log("Received message:", message);
      socket.broadcast.emit("receive_message", { message });

      if (toggleValues.button2 === 1) {
        let voiceSupercollider = new OSC.Message("/voice", 12.221, message);
        osc.send(voiceSupercollider);
      } else if (toggleValues.button3 === 1) {
        let voiceSupercollider = new OSC.Message(
          "/AsciiSynth",
          12.221,
          message
        );
        osc.send(voiceSupercollider);
      }
    } else if (typeof asciiMessage === "string") {
      console.log("Received ascii message:", asciiMessage);
      let asciiMessageSupercollider = new OSC.Message(
        "/ascii",
        12.221,
        asciiMessage
      );
      osc.send(asciiMessageSupercollider);
      io.emit("receive_message", { asciiMessage });
    }
  });

  socket.on("send_message", (data) => {
    const { x, y } = data;

    if (typeof data.x === "number" && typeof data.y === "number") {
      console.log("Mouse Coordinates:", x, y);

      let oscMouseArgs = [x, y];
      let oscMouseMessage = new OSC.Message(
        "/mouseCoordinates",
        oscMouseArgs[0],
        String(oscMouseArgs[1])
      );

      osc.send(oscMouseMessage);
    }
  });
});

server.listen(3001, () => {
  console.log("Server is running...");
});
// const express = require("express");
// const app = express();
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");
// const OSC = require("osc-js");
// const zmq = require("zeromq");

// app.use(cors());
// const osc = new OSC({
//   plugin: new OSC.DatagramPlugin({ send: { port: 57120 } }),
// }); // Set the port to 57120 for sending OSC messages

// const server = http.createServer(app);

// // connecting with the URL from the frontend (localhost:3000)
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// let FadersDictionary = [
//   { name: "fader1", value: 0 },
//   { name: "fader2", value: 0 },
//   { name: "fader3", value: 0 },
//   { name: "fader4", value: 0 },
//   { name: "fader5", value: 0 },
//   { name: "fader6", value: 0 },
//   { name: "fader7", value: 0 },
//   { name: "fader8", value: 0 },
//   { name: "fader9", value: 0 },
//   { name: "fader10", value: 0 },
//   { name: "fader11", value: 0 },
//   { name: "fader12", value: 0 },
//   { name: "fader13", value: 0 },
//   { name: "fader14", value: 0 },
//   { name: "fader15", value: 0 },
//   { name: "fader16", value: 0 },
//   { name: "fader17", value: 0 },
//   { name: "fader18", value: 0 },
//   { name: "fader19", value: 0 },
//   { name: "fader20", value: 0 },
//   { name: "fader21", value: 0 },
//   { name: "fader22", value: 0 },
//   { name: "fader23", value: 0 },
//   { name: "fader24", value: 0 },
//   { name: "fader25", value: 0 },
// ];

// const faderValues = Array(FadersDictionary.length).fill(0);

// let toggleValues = {
//   button1: 0,
//   button2: 0,
//   button3: 0,
//   button4: 0,
//   button5: 0,
//   button6: 0,
//   button7: 0,
//   button8: 0,
//   button9: 0,
//   button10: 0,
//   button11: 0,
//   button12: 0,
//   button13: 0,
//   button14: 0,
//   button15: 0,
// };

// // Set up ZeroMQ
// async function setupZmq() {
//   const zmqSocket = new zmq.Push();
//   await zmqSocket.connect("tcp://192.168.178.81:5555");
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

//   socket.on("send_message", (data) => {
//     const { fader, message } = data;

//     const index = FadersDictionary.findIndex((param) => param.name === fader);

//     if (index !== -1 && typeof message === "number") {
//       FadersDictionary[index].value = message;

//       console.log("Fader value changed:", fader, FadersDictionary[index].value);

//       // Broadcast the updated fader values to all connected clients
//       io.emit("updated_fader_values", FadersDictionary);

//       // Send the OSC message
//       let oscAddress = `${fader}I`;
//       let oscValue = message;
//       let oscMessage = new OSC.Message(oscAddress, oscValue);
//       osc.send(oscMessage);

//       // Send message via ZeroMQ for specific faders
//       if (fader === "fader1") {
//         const msg = JSON.stringify({ cmd: "pan", x: message, y: message });
//         zmqSocket.send(msg);
//         console.log("Sent message via ZeroMQ:", msg);
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

//       // Send the OSC message
//       let oscAddress = `${toggle}I`;
//       let oscValue = toggleValues[toggle];
//       let oscMessage = new OSC.Message(oscAddress, oscValue);
//       osc.send(oscMessage);

//       // Send message via ZeroMQ when button1 is toggled
//       if (toggle === "button1") {
//         const msg = JSON.stringify({ cmd: "keyframe" });
//         zmqSocket.send(msg);
//         console.log("Sent message via ZeroMQ:", msg);
//       }

//       // Send message via ZeroMQ when button1 is toggled
//       if (toggle === "button2") {
//         const msg = JSON.stringify({ cmd: "clean_frame" });
//         zmqSocket.send(msg);
//         console.log("Sent message via ZeroMQ:", msg);
//       }
//     }
//   });

//   socket.on("send_message", (data) => {
//     const { message, asciiMessage } = data;

//     if (typeof message === "string") {
//       console.log("Received message:", message);
//       socket.broadcast.emit("receive_message", { message });

//       if (toggleValues.button2 === 1) {
//         let voiceSupercollider = new OSC.Message("/voice", 12.221, message);
//         osc.send(voiceSupercollider);
//       } else if (toggleValues.button3 === 1) {
//         let voiceSupercollider = new OSC.Message(
//           "/AsciiSynth",
//           12.221,
//           message
//         );
//         osc.send(voiceSupercollider);
//       }
//     } else if (typeof asciiMessage === "string") {
//       console.log("Received ascii message:", asciiMessage);
//       let asciiMessageSupercollider = new OSC.Message(
//         "/ascii",
//         12.221,
//         asciiMessage
//       );
//       osc.send(asciiMessageSupercollider);
//       io.emit("receive_message", { asciiMessage });
//     }
//   });

//   socket.on("send_message", (data) => {
//     const { x, y } = data;

//     if (typeof data.x === "number" && typeof data.y === "number") {
//       console.log("Mouse Coordinates:", x, y);

//       let oscMouseArgs = [x, y];
//       let oscMouseMessage = new OSC.Message(
//         "/mouseCoordinates",
//         oscMouseArgs[0],
//         String(oscMouseArgs[1])
//       );

//       osc.send(oscMouseMessage);
//     }
//   });
// });

// server.listen(3001, () => {
//   console.log("Server is running...");
// });

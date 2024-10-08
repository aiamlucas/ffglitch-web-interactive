# FFglitch Web Interactive

**FFglitch Web Interactive** is a web-based platform designed for real-time interactive control via mobile devices and desktop systems. This project utilizes FFglitch, a fork of FFmpeg for glitching, to allow users to manipulate the encoded data at the bitstream level within image/video codec. The frontend is built with React, while the backend uses Express, with real-time communication facilitated by Socket.IO and ZeroMQ.

## Features

### Client Side (Mobile/Desktop)

- **Gyroscope Interaction**: Move objects on the screen using your mobile device's gyroscope data.
- **Draggable Interface**: Users can drag visual elements on the screen.
- **Real-time Fader Control**: Control numerical values with faders, which can be linked to different visual or audio effects.
- **Toggle Buttons**: Multiple toggle buttons allow users to switch on/off different features (e.g., gyroscope tracking, keyboard control).
- **Keyboard Control**: When enabled, users can move objects on the screen using keyboard arrow keys.
- **WebSocket Communication**: Synchronize state between mobile devices and the server in real time.

### Server Side (Express/Socket.IO/ZeroMQ)

- **WebSocket Communication**: Uses Socket.IO to manage real-time connections between the client and server.
- **ZeroMQ Integration**: ZeroMQ handles inter-process communication (IPC), making the server able to communicate with other local applications or services.
- **SSL Certificate**: Ensures secure connections over HTTPS in a local network.

---

## Prerequisites

### Client

- Node.js (v14 or above)
- npm (or yarn)
- A modern browser that supports the DeviceOrientation API (for mobile gyroscope interaction)

### Server

- Node.js (v14 or above)
- ZeroMQ (for local IPC)
- OpenSSL (for generating local certificates)

### Ffglitch

- **ffglitch**: a multimedia bitstream editor, based on the open-source project FFmpeg.

## Installation and Setup

### 1. Clone the Repository

`git clone https://github.com/your-repo/ffglitch-web-interactive.git`

Navigate into the project root directory:
`cd ffglitch-web-interactive`

### 2. Set Up the Server

Navigate to the `server/` directory:
`cd server`

#### 2.1 Install Dependencies

`npm install`

#### 2.2 Create SSL Certificates (Optional for Local Development)

To enable HTTPS for local development:

1. Generate a private key and certificate:

   ```
   openssl genrsa -out server.key 2048
   openssl req -new -key server.key -out server.csr
   openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.cert
   ```

2. The above commands will generate `server.key` and `server.cert`, which the Express server will use to run over HTTPS.

#### 2.3 Start the Server

`npm start`

The server will start on `https://localhost:3001`.

---

### 3. Set Up the Client

Navigate to the `client/` directory:
`cd ../client`

#### 3.1 Install Dependencies

`npm install`

#### 3.2 Start the Client (Development Mode)

To start the client:
`npm start`

This will launch the React application at `http://localhost:3000`. You can open this in your mobile device or desktop browser.

### 4. Configure HTTPS for Client

To enable HTTPS for the React development server, create a `.env` file in the `client/` directory with the following content:

```
HTTPS=true
SSL_CRT_FILE=../server/server.cert
SSL_KEY_FILE=../server/server.key
```

---

### 5. Running the Video Glitch

To enable the glitch effects on the video stream, you need to run two separate processes in two different terminals:

#### 5.1 Start the ZeroMQ Server

Open a terminal and navigate to the `ffglitch-scripts/` directory:

Start the ZeroMQ server:

```
./qjs path-to/ffglitch-scripts/zmq_server.js
```

#### 5.2 Start the Video Stream with Glitch Effects

Open a second terminal and run the following command to capture and apply glitch effects to your video stream:

```
./ffgac -input_format mjpeg -video_size 1280x720 -i /dev/video0 -vf hflip -c:v mpeg4 -q:v 1 -mpv_flags +nopimb+forcemv -g max -sc_threshold max -mb_type_script path-to/ffglitch-scripts/mb_type.js -pict_type_script path-to/ffglitch-scripts/pict_type.js -f avpipe - | ./fflive -i - -s path-to/ffglitch-scripts/mv_pan.js
```

---

## Project Structure

```
.
├── client
│   ├── public                # Public files for the React app
│   └── src                   # Source files for the React app
│       ├── components        # Reusable React components
│       ├── hooks             # Custom React hooks
│       ├── views             # Views for mobile and desktop UIs
├── ffglitch-scripts           # Scripts to manage the video glitch effects
│   ├── mb_type.js            # Script to modify macroblock types
│   ├── mv_pan.js             # Script to control pan effects
│   └── zmq_server.js         # ZeroMQ server for communication
└── server
    ├── index.js              # Express server with Socket.IO and ZeroMQ
    ├── server.cert           # SSL certificate for HTTPS
    └── server.key            # SSL key for HTTPS
```

---

## Communication Flow

- **Socket.IO**: Real-time communication between the server and the client is facilitated via Socket.IO. Events like dragging the ball, changing fader values, or toggling buttons are sent between the client and server.
- **ZeroMQ**: The server communicates with other local services or processes through ZeroMQ to transmit the video manipulation data (e.g., motion vectors, glitch parameters).

---

## Contributions

**Ramiro Polla** for his contributions to the project.  
The **FFglitch** community for providing inspiration and tools for glitching images.

Learn more about **FFglitch** and its usage at:

- `https://ffglitch.org/`
- `https://github.com/ramiropolla/ffglitch-scripts/tree/main/tutorial`

To contribute:

1. Fork the repository.
2. Create a new feature branch.
3. Make your changes and commit.
4. Submit a pull request.

---

## License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**. You are free to use, modify, and distribute this software under the terms of this license.

For the full license text, see the `LICENSE` file in the root of this repository.

For the **ffglitch-scripts** folder, the scripts are released under **The Unlicense**, and are in the public domain. See the `ffglitch-scripts/LICENSE` file for details.

---

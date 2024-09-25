// client/views/Mobile/AppMobile.js

import "../Mobile/AppMobile.css";
import { useState, useEffect } from "react";
import Draggable from "react-draggable"; // Import Draggable library
import "@fontsource/roboto"; // Import Roboto font
import { useDeviceOrientation } from "../../hooks/useDeviceOrientation"; // Import your hook
import FadersGroup from "../../components/FadersGroup/FadersGroup"; // Import FadersGroup
import io from "socket.io-client";

// Establish the socket connection
const socket = io.connect("https://localhost:3001", {
  secure: true,
  rejectUnauthorized: false,
});

// Generate dictionaries for faders
const generateItemsDictionary = (numItems, prefix) => {
  return Array.from({ length: numItems }, (_, i) => ({
    name: `${prefix}${i + 1}`,
    value: 0,
  }));
};

const FadersDictionary = generateItemsDictionary(2, "fader"); // Two faders

export default function AppMobile() {
  const { orientation, requestAccess, revokeAccess, error } =
    useDeviceOrientation(); // Use the hook
  const [isTracking, setIsTracking] = useState(false);
  const [lastEvent, setLastEvent] = useState(""); // Store the last event
  const [isDragging, setIsDragging] = useState(false); // State for dragging
  const [ballPosition, setBallPosition] = useState({ x: 0, y: 0 }); // Store the current ball position
  const [faderValues, setFaderValues] = useState(
    Array(FadersDictionary.length).fill(0)
  );
  const [buttonValues, setButtonValues] = useState([0, 1, 1, 0, 0, 0]); // Initialize buttonValues

  const handleButtonToggle = (index) => {
    const updatedButtonValues = [...buttonValues];
    updatedButtonValues[index] = buttonValues[index] === 0 ? 1 : 0;

    // Emit the toggle event to the server
    const buttonName = `button${index + 1}`;
    socket.emit("send_toggle_value", {
      toggle: buttonName,
      value: updatedButtonValues[index],
    });

    // Send log message to the server based on the button pressed
    switch (index) {
      case 0:
        socket.emit("broadcast_log", "Clear Glitch");
        break;
      case 1:
        socket.emit(
          "broadcast_log",
          `X-axis: ${updatedButtonValues[1] ? "On" : "Off"}`
        );
        break;
      case 2:
        socket.emit(
          "broadcast_log",
          `Y-axis: ${updatedButtonValues[2] ? "On" : "Off"}`
        );
        break;
      case 3:
        socket.emit(
          "broadcast_log",
          `AMV: ${updatedButtonValues[3] ? "On" : "Off"}`
        );
        break;
      case 4:
        socket.emit(
          "broadcast_log",
          `Keyboard: ${updatedButtonValues[4] ? "On" : "Off"}`
        );
        break;

      case 5: // Large circle, control tracking
        if (updatedButtonValues[5]) {
          requestAccess(); // Start gyroscope tracking
          setIsTracking(true);
        } else {
          revokeAccess(); // Stop gyroscope tracking
          setIsTracking(false);
        }
        break;
      default:
        break;
    }

    setButtonValues(updatedButtonValues);
  };

  const handleFaderChange = (index, value) => {
    const newFaderValues = [...faderValues];
    newFaderValues[index] = value;
    setFaderValues(newFaderValues);

    // Emit the fader change to the server
    const faderName = `fader${index + 1}`;
    socket.emit("send_message", { fader: faderName, message: value });
  };

  const handleClearGlitchStart = () => {
    const updatedButtonValues = [...buttonValues];
    updatedButtonValues[0] = 1; // Push button (long press) at index 0
    setButtonValues(updatedButtonValues);

    socket.emit("broadcast_log", "Clear Glitch");
    socket.emit("send_toggle_value", { toggle: "button1", value: 1 });
  };

  const handleClearGlitchEnd = () => {
    const updatedButtonValues = [...buttonValues];
    updatedButtonValues[0] = 0; // Reset push button state
    setButtonValues(updatedButtonValues);

    socket.emit("send_toggle_value", { toggle: "button1", value: 0 });
  };

  // Update the logs with the ball's position
  const updateLogWithPosition = (x, y) => {
    setLastEvent(`Ball Position - X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}`);
  };

  // Handle the start of dragging
  const handleStartDrag = () => {
    setIsDragging(true);
  };

  // Handle the stop of dragging
  const handleStopDrag = () => {
    setIsDragging(false);
    // Reset the ball position to center (0, 0)
    setBallPosition({ x: 0, y: 0 });
    updateLogWithPosition(0, 0); // Log reset to center
  };

  // Handle dragging event
  const handleDrag = (e, data) => {
    setBallPosition({ x: data.x, y: data.y });
    // Optionally, send ball position to server or update logs
  };

  // Map gyroscope values to the range between -50% and +50% of the screen width/height
  const mapGyroscopeToScreen = (value, minInput, maxInput) => {
    if (value === null || isNaN(value)) return 0; // Default to the center
    const mappedValue =
      ((value - minInput) * (50 - -50)) / (maxInput - minInput) + -50;
    return Math.max(-50, Math.min(mappedValue, 50)); // Ensure it stays within bounds
  };

  const ballXPercent =
    buttonValues[1] && !isDragging && isTracking
      ? mapGyroscopeToScreen(orientation?.gamma, -60, 60)
      : ballPosition.x;

  const ballYPercent =
    buttonValues[2] && !isDragging && isTracking
      ? mapGyroscopeToScreen(orientation?.beta, -45, 45)
      : ballPosition.y;

  // Format values to have 2 digits after the comma
  const formatValue = (value) => (value !== null ? value.toFixed(2) : "0.00");

  useEffect(() => {
    // Listen for initial fader values when the mobile client connects
    socket.on("initial_fader_values", (data) => {
      const initialValues = data.map((faderValue) => faderValue.value);
      setFaderValues(initialValues);
    });

    // Listen for updated fader values
    socket.on("updated_fader_values", (data) => {
      const updatedValues = data.map((faderValue) => faderValue.value);

      // Compare and log only the fader that changed
      updatedValues.forEach((value, index) => {
        if (value !== faderValues[index]) {
          setLastEvent(`Fader${index + 1}: ${value.toFixed(2)}`);
        }
      });

      // Update the state with the new fader values
      setFaderValues(updatedValues);
    });

    // Clean up when the component unmounts
    return () => {
      socket.off("initial_fader_values");
      socket.off("updated_fader_values");
    };
  }, [faderValues]);

  useEffect(() => {
    // Listen for updated button values from the server
    socket.on("updated_toggle_values", (data) => {
      const updatedButtonValues = Object.values(data);
      setButtonValues(updatedButtonValues);
    });

    return () => {
      socket.off("updated_toggle_values");
    };
  }, []);

  useEffect(() => {
    // Listen for the log broadcast from the server
    socket.on("receive_log", (logMessage) => {
      setLastEvent(logMessage); // Update the log message for all clients
    });

    return () => {
      socket.off("receive_log");
    };
  }, []);

  return (
    <div className="mobile-container">
      {/* Draggable Logs */}
      <Draggable>
        <div className="log-container">
          <ul>
            <li>ɑ: {formatValue(orientation.alpha)}</li>
            <li>β: {formatValue(orientation.beta)}</li>
            <li>γ: {formatValue(orientation.gamma)}</li>
            <li>X-axis: {ballXPercent.toFixed(2)}</li> {/* Log X-axis */}
            <li>Y-axis: {ballYPercent.toFixed(2)}</li> {/* Log Y-axis */}
            <li>{lastEvent}</li> {/* Display last event log here */}
          </ul>
        </div>
      </Draggable>

      {/* Large Circle that acts as a toggle button */}
      <div
        className={`large-circle ${buttonValues[5] ? "toggled" : ""}`} // Use buttonValues[5] to manage toggled state
        onClick={() => handleButtonToggle(5)} // Handle the toggle via buttonValues[5]
      >
        {/* X and Y axis lines */}
        {buttonValues[5] === 1 && (
          <>
            <div className="x-axis-line"></div>
            <div className="y-axis-line"></div>
          </>
        )}
        {buttonValues[5] === 1 && <div className="inner-circle"></div>}
      </div>

      {/* Small Ball moves based on orientation within the full screen */}
      <Draggable
        position={isDragging ? ballPosition : null}
        positionOffset={{ x: "-0.7rem", y: "-0.7rem" }} // Shift the ball slightly
        onStart={handleStartDrag}
        onStop={handleStopDrag}
        onDrag={handleDrag}
      >
        <div
          className="small-ball"
          style={{
            left: !isDragging ? `calc(50% + ${ballXPercent}%)` : undefined,
            top: !isDragging ? `calc(50% + ${ballYPercent}%)` : undefined,
            transform: `translate(-50%, -50%)`, // Ensures the center of the ball aligns with the cross
            position: isDragging ? "absolute" : "fixed",
          }}
        ></div>
      </Draggable>

      {/* Faders on the top-left part */}
      <div className="faders-container">
        <FadersGroup
          faders={FadersDictionary}
          values={faderValues}
          handleChange={handleFaderChange}
        />
      </div>

      {/* Bottom buttons: Clear Glitch and four small toggle buttons */}
      <div className="bottom-buttons">
        {/* Long Push Button */}
        <div
          className={`clear-glitch-button ${buttonValues[0] ? "pressed" : ""}`} // Apply the "pressed" class when buttonValues[0] is 1
          onMouseDown={handleClearGlitchStart}
          onMouseUp={handleClearGlitchEnd}
          onTouchStart={handleClearGlitchStart}
          onTouchEnd={handleClearGlitchEnd}
        ></div>

        {/* Toggle Buttons */}
        {buttonValues.slice(1, 5).map((value, index) => (
          <div
            key={index}
            className={`small-toggle-button ${value ? "active" : ""}`}
            onClick={() => handleButtonToggle(index + 1)} // Buttons 1 to 4 mapped to indices 1-4
            style={{ opacity: value ? 1 : 0.2 }}
          ></div>
        ))}
      </div>
    </div>
  );
}

// // //client/views/Mobile/AppMobile.js
// import "../Mobile/AppMobile.css";
// import { useState, useEffect } from "react";
// import Draggable from "react-draggable"; // Import Draggable library
// import "@fontsource/roboto"; // Import Roboto font
// import { useDeviceOrientation } from "../../hooks/useDeviceOrientation"; // Import your hook
// import FadersGroup from "../../components/FadersGroup/FadersGroup"; // Import FadersGroup
// import io from "socket.io-client";

// // Establish the socket connection
// const socket = io.connect("https://localhost:3001", {
//   secure: true,
//   rejectUnauthorized: false,
// });

// // Generate dictionaries for faders
// const generateItemsDictionary = (numItems, prefix) => {
//   return Array.from({ length: numItems }, (_, i) => ({
//     name: `${prefix}${i + 1}`,
//     value: 0,
//   }));
// };

// const FadersDictionary = generateItemsDictionary(2, "fader"); // Two faders

// export default function AppMobile() {
//   const { orientation, requestAccess, revokeAccess, error } =
//     useDeviceOrientation(); // Use the hook
//   const [isTracking, setIsTracking] = useState(false);
//   const [lastEvent, setLastEvent] = useState(""); // Store the last event
//   const [isDragging, setIsDragging] = useState(false); // State for dragging
//   const [ballPosition, setBallPosition] = useState({ x: 0, y: 0 }); // Store the current ball position
//   const [faderValues, setFaderValues] = useState(
//     Array(FadersDictionary.length).fill(0)
//   );
//   const [buttonValues, setButtonValues] = useState(Array(6).fill(0));

//   const handleButtonToggle = (index) => {
//     const updatedButtonValues = [...buttonValues];
//     updatedButtonValues[index] = buttonValues[index] === 0 ? 1 : 0;

//     // Emit the toggle event to the server
//     const buttonName = `button${index + 1}`;
//     socket.emit("send_toggle_value", {
//       toggle: buttonName,
//       value: updatedButtonValues[index],
//     });

//     // Send log message to the server based on the button pressed
//     switch (index) {
//       case 0:
//         socket.emit("broadcast_log", "Clear Glitch");
//         break;
//       case 1:
//         socket.emit(
//           "broadcast_log",
//           `X-axis: ${updatedButtonValues[1] ? "On" : "Off"}`
//         );
//         break;
//       case 2:
//         socket.emit(
//           "broadcast_log",
//           `Y-axis: ${updatedButtonValues[2] ? "On" : "Off"}`
//         );
//         break;
//       case 3:
//         socket.emit(
//           "broadcast_log",
//           `AMV: ${updatedButtonValues[3] ? "On" : "Off"}`
//         );
//         break;
//       case 4:
//         socket.emit(
//           "broadcast_log",
//           `Keyboard: ${updatedButtonValues[4] ? "On" : "Off"}`
//         );
//         break;

//       case 5: // Large circle, control tracking
//         if (updatedButtonValues[5]) {
//           requestAccess(); // Start gyroscope tracking
//           setIsTracking(true);
//         } else {
//           revokeAccess(); // Stop gyroscope tracking
//           setIsTracking(false);
//         }
//         break;
//       default:
//         break;
//     }

//     setButtonValues(updatedButtonValues);
//   };

//   // const handleButtonToggle = (index) => {
//   //   const updatedButtonValues = [...buttonValues];
//   //   updatedButtonValues[index] = buttonValues[index] === 0 ? 1 : 0;

//   //   // Emit the toggle event to the server
//   //   const buttonName = `button${index + 1}`;
//   //   socket.emit("send_toggle_value", {
//   //     toggle: buttonName,
//   //     value: updatedButtonValues[index],
//   //   });

//   //   // Send log message to the server instead of setting it locally
//   //   switch (index) {
//   //     case 0:
//   //       socket.emit("broadcast_log", "Clear Glitch");
//   //       break;
//   //     case 1:
//   //       socket.emit(
//   //         "broadcast_log",
//   //         `X-axis: ${updatedButtonValues[1] ? "On" : "Off"}`
//   //       );
//   //       break;
//   //     case 2:
//   //       socket.emit(
//   //         "broadcast_log",
//   //         `Y-axis: ${updatedButtonValues[2] ? "On" : "Off"}`
//   //       );
//   //       break;
//   //     case 3:
//   //       socket.emit(
//   //         "broadcast_log",
//   //         `AMV: ${updatedButtonValues[3] ? "On" : "Off"}`
//   //       );
//   //       break;
//   //     case 4:
//   //       socket.emit(
//   //         "broadcast_log",
//   //         `Keyboard: ${updatedButtonValues[4] ? "On" : "Off"}`
//   //       );
//   //       break;
//   //     default:
//   //       break;
//   //   }

//   //   setButtonValues(updatedButtonValues);
//   // };

//   const handleFaderChange = (index, value) => {
//     const newFaderValues = [...faderValues];
//     newFaderValues[index] = value;
//     setFaderValues(newFaderValues);

//     // Emit the fader change to the server
//     const faderName = `fader${index + 1}`;
//     socket.emit("send_message", { fader: faderName, message: value });
//     // Log the fader change to lastEvent
//     // setLastEvent(`${faderName}: ${value.toFixed(2)}`);
//   };

//   const handleClearGlitchStart = () => {
//     const updatedButtonValues = [...buttonValues];
//     updatedButtonValues[0] = 1; // Push button (long press) at index 0
//     setButtonValues(updatedButtonValues);
//     // setLastEvent("Clear Glitch");
//     socket.emit("broadcast_log", "Clear Glitch");

//     socket.emit("send_toggle_value", { toggle: "button1", value: 1 });
//   };

//   const handleClearGlitchEnd = () => {
//     const updatedButtonValues = [...buttonValues];
//     updatedButtonValues[0] = 0; // Reset push button state
//     setButtonValues(updatedButtonValues);
//     setLastEvent("Clear Glitch");

//     socket.emit("send_toggle_value", { toggle: "button1", value: 0 });
//   };

//   // Update the logs with the ball's position
//   const updateLogWithPosition = (x, y) => {
//     setLastEvent(`Ball Position - X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}`);
//   };

//   // Handle the start of dragging
//   const handleStartDrag = () => {
//     setIsDragging(true);
//   };

//   // Handle the stop of dragging
//   const handleStopDrag = () => {
//     setIsDragging(false);
//     // Reset the ball position to center (0, 0)
//     setBallPosition({ x: 0, y: 0 });
//     updateLogWithPosition(0, 0); // Log reset to center
//   };

//   // Handle dragging event
//   const handleDrag = (e, data) => {
//     setBallPosition({ x: data.x, y: data.y });
//     // updateLogWithPosition(data.x, data.y);
//   };

//   // Map gyroscope values to the range between -50% and +50% of the screen width/height
//   const mapGyroscopeToScreen = (value, minInput, maxInput) => {
//     if (value === null || isNaN(value)) return 0; // Default to the center
//     const mappedValue =
//       ((value - minInput) * (50 - -50)) / (maxInput - minInput) + -50;
//     return Math.max(-50, Math.min(mappedValue, 50)); // Ensure it stays within bounds
//   };

//   const ballXPercent =
//     buttonValues[1] && !isDragging && isTracking
//       ? mapGyroscopeToScreen(orientation?.gamma, -60, 60)
//       : ballPosition.x;

//   const ballYPercent =
//     buttonValues[2] && !isDragging && isTracking
//       ? mapGyroscopeToScreen(orientation?.beta, -45, 45)
//       : ballPosition.y;

//   // const ballXPercent =
//   //   buttonValues[1] && !isDragging
//   //     ? mapGyroscopeToScreen(orientation?.gamma, -60, 60)
//   //     : ballPosition.x;

//   // const ballYPercent =
//   //   buttonValues[2] && !isDragging
//   //     ? mapGyroscopeToScreen(orientation?.beta, -45, 45)
//   //     : ballPosition.y;

//   // Format values to have 2 digits after the comma
//   const formatValue = (value) => (value !== null ? value.toFixed(2) : "0.00");

//   useEffect(() => {
//     // Listen for initial fader values when the mobile client connects
//     socket.on("initial_fader_values", (data) => {
//       const initialValues = data.map((faderValue) => faderValue.value);
//       setFaderValues(initialValues);
//     });

//     // Listen for updated fader values
//     socket.on("updated_fader_values", (data) => {
//       const updatedValues = data.map((faderValue) => faderValue.value);

//       // Compare and log only the fader that changed
//       updatedValues.forEach((value, index) => {
//         if (value !== faderValues[index]) {
//           setLastEvent(`Fader${index + 1}: ${value.toFixed(2)}`);
//         }
//       });

//       // Update the state with the new fader values
//       setFaderValues(updatedValues);
//     });

//     // Clean up when the component unmounts
//     return () => {
//       socket.off("initial_fader_values");
//       socket.off("updated_fader_values");
//     };
//   }, []);

//   useEffect(() => {
//     // Listen for updated button values from the server
//     socket.on("updated_toggle_values", (data) => {
//       const updatedButtonValues = Object.values(data);
//       setButtonValues(updatedButtonValues);
//     });

//     return () => {
//       socket.off("updated_toggle_values");
//     };
//   }, []);

//   useEffect(() => {
//     // Listen for the log broadcast from the server
//     socket.on("receive_log", (logMessage) => {
//       setLastEvent(logMessage); // Update the log message for all clients
//     });

//     return () => {
//       socket.off("receive_log");
//     };
//   }, []);

//   return (
//     <div className="mobile-container">
//       {/* Draggable Logs */}
//       <Draggable>
//         <div className="log-container">
//           <ul>
//             <li>ɑ: {formatValue(orientation.alpha)}</li>
//             <li>β: {formatValue(orientation.beta)}</li>
//             <li>γ: {formatValue(orientation.gamma)}</li>
//             <li>X-axis: {ballXPercent.toFixed(2)}</li> {/* Log X-axis */}
//             <li>Y-axis: {ballYPercent.toFixed(2)}</li> {/* Log Y-axis */}
//             <li>{lastEvent}</li> {/* Display last event log here */}
//           </ul>
//         </div>
//       </Draggable>

//       {/* Large Circle that acts as a toggle button */}
//       <div
//         className={`large-circle ${buttonValues[5] ? "toggled" : ""}`} // Use buttonValues[5] to manage toggled state
//         onClick={() => handleButtonToggle(5)} // Handle the toggle via buttonValues[5]
//       >
//         {/* X and Y axis lines */}
//         {buttonValues[5] === 1 && (
//           <>
//             <div className="x-axis-line"></div>
//             <div className="y-axis-line"></div>
//           </>
//         )}
//         {buttonValues[5] === 1 && <div className="inner-circle"></div>}
//       </div>

//       {/* Small Ball moves based on orientation within the full screen */}
//       <Draggable
//         position={ballPosition}
//         positionOffset={{ x: "-0.7rem", y: "-0.7rem" }} // Shift the ball slightly
//         onStart={handleStartDrag}
//         onStop={handleStopDrag}
//         onDrag={handleDrag}
//       >
//         <div
//           className="small-ball"
//           style={{
//             left: !isDragging ? `calc(50% + ${ballXPercent}%)` : undefined,
//             top: !isDragging ? `calc(50% + ${ballYPercent}%)` : undefined,
//             transform: `translate(-50%, -50%)`, // Ensures the center of the ball aligns with the cross
//             position: isDragging ? "absolute" : "fixed",
//           }}
//         ></div>
//       </Draggable>

//       {/* Faders on the top-left part */}
//       <div className="faders-container">
//         <FadersGroup
//           faders={FadersDictionary}
//           values={faderValues}
//           handleChange={handleFaderChange}
//         />
//       </div>

//       {/* Bottom buttons: Clear Glitch and four small toggle buttons */}
//       <div className="bottom-buttons">
//         {/* Long Push Button */}
//         <div
//           className={`clear-glitch-button ${buttonValues[0] ? "pressed" : ""}`} // Apply the "pressed" class when buttonValues[0] is 1
//           onMouseDown={handleClearGlitchStart}
//           onMouseUp={handleClearGlitchEnd}
//           onTouchStart={handleClearGlitchStart}
//           onTouchEnd={handleClearGlitchEnd}
//         ></div>

//         {/* Toggle Buttons */}
//         {buttonValues.slice(1, 5).map((value, index) => (
//           <div
//             key={index}
//             className={`small-toggle-button ${value ? "active" : ""}`}
//             onClick={() => handleButtonToggle(index + 1)} // Buttons 1 to 4 mapped to indices 1-4
//             style={{ opacity: value ? 1 : 0.2 }}
//           ></div>
//         ))}
//       </div>
//     </div>
//   );
// }

// ----------------------------
// import "../Mobile/AppMobile.css";
// import { useState, useEffect } from "react";
// import Draggable from "react-draggable"; // Import Draggable library
// import "@fontsource/roboto"; // Import Roboto font
// import { useDeviceOrientation } from "../../hooks/useDeviceOrientation"; // Import your hook
// import FadersGroup from "../../components/FadersGroup/FadersGroup"; // Import FadersGroup
// import io from "socket.io-client";

// // Establish the socket connection
// const socket = io.connect("https://localhost:3001", {
//   secure: true,
//   rejectUnauthorized: false,
// });

// // Generate dictionaries for faders
// const generateItemsDictionary = (numItems, prefix) => {
//   return Array.from({ length: numItems }, (_, i) => ({
//     name: `${prefix}${i + 1}`,
//     value: 0,
//   }));
// };

// const FadersDictionary = generateItemsDictionary(2, "fader"); // Two faders

// export default function AppMobile() {
//   const { orientation, requestAccess, revokeAccess, error } =
//     useDeviceOrientation(); // Use the hook
//   const [isTracking, setIsTracking] = useState(false);
//   const [lastEvent, setLastEvent] = useState(""); // Store the last event
//   const [isDragging, setIsDragging] = useState(false); // State for dragging
//   const [ballPosition, setBallPosition] = useState({ x: 0, y: 0 }); // Store the current ball position
//   const [faderValues, setFaderValues] = useState(
//     Array(FadersDictionary.length).fill(0)
//   );
//   const [buttonValues, setButtonValues] = useState(
//     Array(6).fill(0) // 4 buttons
//   );

//   const handleButtonToggle = (index) => {
//     const updatedButtonValues = [...buttonValues];
//     updatedButtonValues[index] = buttonValues[index] === 0 ? 1 : 0;

//     // Emit the toggle event to the server
//     const buttonName = `button${index + 1}`;
//     socket.emit("send_toggle_value", {
//       toggle: buttonName,
//       value: updatedButtonValues[index],
//     });

//     setButtonValues(updatedButtonValues);
//     setLastEvent(`Toggled ${buttonName} to ${updatedButtonValues[index]}`);

//     // If it's the large circle (index 5), control tracking
//     if (index === 5) {
//       if (updatedButtonValues[5]) {
//         requestAccess(); // Start tracking
//         setIsTracking(true);
//       } else {
//         revokeAccess(); // Stop tracking
//         setIsTracking(false);
//       }
//     }
//   };

//   const handleFaderChange = (index, value) => {
//     const newFaderValues = [...faderValues];
//     newFaderValues[index] = value;
//     setFaderValues(newFaderValues);

//     // Emit the fader change to the server
//     const faderName = `fader${index + 1}`;
//     socket.emit("send_message", { fader: faderName, message: value });
//     // Log the fader change to lastEvent
//     // setLastEvent(`${faderName}: ${value.toFixed(2)}`);
//   };

//   // const handleLargeToggleClick = async (event) => {
//   //   event.preventDefault();
//   //   const updatedButtonValues = [...buttonValues];
//   //   updatedButtonValues[5] = buttonValues[5] === 0 ? 1 : 0; // Large circle at index 5

//   //   setButtonValues(updatedButtonValues);
//   //   setLastEvent(`Circle ${updatedButtonValues[5] ? "On" : "Off"}`);

//   //   // Emit to server
//   //   socket.emit("send_toggle_value", { toggle: "button6" }); // button6 for large circle

//   //   if (updatedButtonValues[5]) {
//   //     requestAccess(); // Start tracking
//   //     setIsTracking(true);
//   //   } else {
//   //     revokeAccess(); // Stop tracking
//   //     setIsTracking(false);
//   //   }
//   // };

//   const handleClearGlitchStart = () => {
//     const updatedButtonValues = [...buttonValues];
//     updatedButtonValues[0] = 1; // Push button (long press) at index 0
//     setButtonValues(updatedButtonValues);
//     setLastEvent("Clear Glitch Started");

//     socket.emit("send_toggle_value", { toggle: "button1", value: 1 });
//   };

//   const handleClearGlitchEnd = () => {
//     const updatedButtonValues = [...buttonValues];
//     updatedButtonValues[0] = 0; // Reset push button state
//     setButtonValues(updatedButtonValues);
//     setLastEvent("Clear Glitch Ended");

//     socket.emit("send_toggle_value", { toggle: "button1", value: 0 });
//   };

//   // Update the logs with the ball's position
//   const updateLogWithPosition = (x, y) => {
//     setLastEvent(`Ball Position - X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}`);
//   };

//   // Handle the start of dragging
//   const handleStartDrag = () => {
//     setIsDragging(true);
//   };

//   // Handle the stop of dragging
//   const handleStopDrag = () => {
//     setIsDragging(false);
//     // Reset the ball position to center (0, 0)
//     setBallPosition({ x: 0, y: 0 });
//     updateLogWithPosition(0, 0); // Log reset to center
//   };

//   // Handle dragging event
//   const handleDrag = (e, data) => {
//     setBallPosition({ x: data.x, y: data.y });
//     // updateLogWithPosition(data.x, data.y);
//   };

//   // Map gyroscope values to the range between -50% and +50% of the screen width/height
//   const mapGyroscopeToScreen = (value, minInput, maxInput) => {
//     if (value === null || isNaN(value)) return 0; // Default to the center
//     const mappedValue =
//       ((value - minInput) * (50 - -50)) / (maxInput - minInput) + -50;
//     return Math.max(-50, Math.min(mappedValue, 50)); // Ensure it stays within bounds
//   };

//   const ballXPercent =
//     buttonValues[1] && !isDragging
//       ? mapGyroscopeToScreen(orientation?.gamma, -60, 60)
//       : ballPosition.x;

//   const ballYPercent =
//     buttonValues[2] && !isDragging
//       ? mapGyroscopeToScreen(orientation?.beta, -45, 45)
//       : ballPosition.y;

//   // Format values to have 2 digits after the comma
//   const formatValue = (value) => (value !== null ? value.toFixed(2) : "0.00");

//   useEffect(() => {
//     // Listen for initial fader values when the mobile client connects
//     socket.on("initial_fader_values", (data) => {
//       const initialValues = data.map((faderValue) => faderValue.value);
//       setFaderValues(initialValues);
//     });

//     // Listen for updated fader values
//     socket.on("updated_fader_values", (data) => {
//       const updatedValues = data.map((faderValue) => faderValue.value);

//       // Compare and log only the fader that changed
//       updatedValues.forEach((value, index) => {
//         if (value !== faderValues[index]) {
//           setLastEvent(`Fader${index + 1}: ${value.toFixed(2)}`);
//         }
//       });

//       // Update the state with the new fader values
//       setFaderValues(updatedValues);
//     });

//     // Clean up when the component unmounts
//     return () => {
//       socket.off("initial_fader_values");
//       socket.off("updated_fader_values");
//     };
//   }, []);

//   useEffect(() => {
//     // Listen for updated button values from the server
//     socket.on("updated_toggle_values", (data) => {
//       const updatedButtonValues = Object.values(data);
//       setButtonValues(updatedButtonValues);
//     });

//     return () => {
//       socket.off("updated_toggle_values");
//     };
//   }, []);

//   return (
//     <div className="mobile-container">
//       {/* Draggable Logs */}
//       <Draggable>
//         <div className="log-container">
//           <ul>
//             <li>ɑ: {formatValue(orientation.alpha)}</li>
//             <li>β: {formatValue(orientation.beta)}</li>
//             <li>γ: {formatValue(orientation.gamma)}</li>
//             <li>X-axis: {ballXPercent.toFixed(2)}</li> {/* Log X-axis */}
//             <li>Y-axis: {ballYPercent.toFixed(2)}</li> {/* Log Y-axis */}
//             <li>{lastEvent}</li> {/* Display last event log here */}
//           </ul>
//         </div>
//       </Draggable>

//       {/* Large Circle that acts as a toggle button */}
//       <div
//         className={`large-circle ${buttonValues[5] ? "toggled" : ""}`} // Use buttonValues[5] to manage toggled state
//         onClick={() => handleButtonToggle(5)} // Handle the toggle via buttonValues[5]
//       >
//         {/* X and Y axis lines */}
//         {buttonValues[5] === 1 && (
//           <>
//             <div className="x-axis-line"></div>
//             <div className="y-axis-line"></div>
//           </>
//         )}
//         {buttonValues[5] === 1 && <div className="inner-circle"></div>}
//       </div>

//       {/* Small Ball moves based on orientation within the full screen */}
//       <Draggable
//         position={ballPosition}
//         positionOffset={{ x: "-0.7rem", y: "-0.7rem" }} // Shift the ball slightly
//         onStart={handleStartDrag}
//         onStop={handleStopDrag}
//         onDrag={handleDrag}
//       >
//         <div
//           className="small-ball"
//           style={{
//             left: !isDragging ? `calc(50% + ${ballXPercent}%)` : undefined,
//             top: !isDragging ? `calc(50% + ${ballYPercent}%)` : undefined,
//             transform: `translate(-50%, -50%)`, // Ensures the center of the ball aligns with the cross
//             position: isDragging ? "absolute" : "fixed",
//           }}
//         ></div>
//       </Draggable>

//       {/* Faders on the top-left part */}
//       <div className="faders-container">
//         <FadersGroup
//           faders={FadersDictionary}
//           values={faderValues}
//           handleChange={handleFaderChange}
//         />
//       </div>

//       {/* Bottom buttons: Clear Glitch and four small toggle buttons */}
//       <div className="bottom-buttons">
//         {/* Long Push Button */}
//         <div
//           className={`clear-glitch-button ${buttonValues[0] ? "pressed" : ""}`} // Apply the "pressed" class when buttonValues[0] is 1
//           onMouseDown={handleClearGlitchStart}
//           onMouseUp={handleClearGlitchEnd}
//           onTouchStart={handleClearGlitchStart}
//           onTouchEnd={handleClearGlitchEnd}
//         ></div>

//         {/* Toggle Buttons */}
//         {buttonValues.slice(1, 5).map((value, index) => (
//           <div
//             key={index}
//             className={`small-toggle-button ${value ? "active" : ""}`}
//             onClick={() => handleButtonToggle(index + 1)} // Buttons 1 to 4 mapped to indices 1-4
//             style={{ opacity: value ? 1 : 0.2 }}
//           ></div>
//         ))}
//       </div>
//     </div>
//   );
// }

// import "../Mobile/AppMobile.css";
// import { useState, useEffect } from "react";
// import Draggable from "react-draggable"; // Import Draggable library
// import "@fontsource/roboto"; // Import Roboto font
// import { useDeviceOrientation } from "../../hooks/useDeviceOrientation"; // Import your hook
// import FadersGroup from "../../components/FadersGroup/FadersGroup"; // Import FadersGroup

// // Generate dictionaries for faders
// const generateItemsDictionary = (numItems, prefix) => {
//   return Array.from({ length: numItems }, (_, i) => ({
//     name: `${prefix}${i + 1}`,
//     value: 0,
//   }));
// };

// const FadersDictionary = generateItemsDictionary(2, "fader"); // Two faders

// export default function AppMobile() {
//   const { orientation, requestAccess, revokeAccess, error } =
//     useDeviceOrientation(); // Use the hook
//   const [isTracking, setIsTracking] = useState(false);
//   const [isLargeToggled, setIsLargeToggled] = useState(false); // State for large button
//   const [isSmallToggled1, setIsSmallToggled1] = useState(true); // X-axis toggle (default to enabled)
//   const [isSmallToggled2, setIsSmallToggled2] = useState(true); // Y-axis toggle (default to enabled)
//   const [isSmallToggled3, setIsSmallToggled3] = useState(true); // Additional toggle button
//   const [isSmallToggled4, setIsSmallToggled4] = useState(true); // Additional toggle button
//   const [isClearGlitch, setIsClearGlitch] = useState(false); // State for Clear Glitch button
//   const [lastEvent, setLastEvent] = useState(""); // Store the last event
//   const [isDragging, setIsDragging] = useState(false); // State for dragging
//   const [ballPosition, setBallPosition] = useState({ x: 0, y: 0 }); // Store the current ball position

//   // Fader state management
//   const [faderValues, setFaderValues] = useState(
//     Array(FadersDictionary.length).fill(0)
//   );

//   const handleFaderChange = (index, value) => {
//     const newFaderValues = [...faderValues];
//     newFaderValues[index] = value;
//     setFaderValues(newFaderValues);

//     // Update the lastEvent to log the fader change
//     setLastEvent(`Fader${index + 1}: ${newFaderValues[index].toFixed(2)}`);
//   };

//   const handleSmallToggleClick1 = () => {
//     setIsSmallToggled1((prev) => !prev);
//     setLastEvent(`X-Axis ${isSmallToggled1 ? "Off" : "On"}`);
//   };

//   const handleSmallToggleClick2 = () => {
//     setIsSmallToggled2((prev) => !prev);
//     setLastEvent(`Y-Axis ${isSmallToggled2 ? "Off" : "On"}`);
//   };

//   const handleSmallToggleClick3 = () => {
//     setIsSmallToggled3((prev) => !prev);
//     setLastEvent(`Toggle 1 ${isSmallToggled3 ? "Off" : "On"}`);
//   };

//   const handleSmallToggleClick4 = () => {
//     setIsSmallToggled4((prev) => !prev);
//     setLastEvent(`Toggle 2 ${isSmallToggled4 ? "Off" : "On"}`);
//   };

//   // Handle toggling the large button (which is the circle now)
//   const handleLargeToggleClick = async (event) => {
//     event.preventDefault();
//     setIsLargeToggled((prev) => {
//       const newState = !prev;
//       if (newState) {
//         requestAccess(); // Start tracking
//         setIsTracking(true);
//       } else {
//         revokeAccess(); // Stop tracking
//         setIsTracking(false);
//       }
//       setLastEvent(`Circle ${newState ? "On" : "Off"}`);
//       return newState;
//     });
//   };

//   // Handle Clear Glitch button start and end
//   const handleClearGlitchStart = () => {
//     setIsClearGlitch(true);
//     setLastEvent("Clear Glitch");
//   };

//   const handleClearGlitchEnd = () => {
//     setIsClearGlitch(false);
//   };

//   // Update the logs with the ball's position
//   const updateLogWithPosition = (x, y) => {
//     setLastEvent(`Ball Position - X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}`);
//   };

//   // Handle the start of dragging
//   const handleStartDrag = () => {
//     setIsDragging(true);
//   };

//   // Handle the stop of dragging
//   const handleStopDrag = () => {
//     setIsDragging(false);
//     // Reset the ball position to center (0, 0)
//     setBallPosition({ x: 0, y: 0 });
//     updateLogWithPosition(0, 0); // Log reset to center
//   };

//   // Handle dragging event
//   const handleDrag = (e, data) => {
//     setBallPosition({ x: data.x, y: data.y });
//     // updateLogWithPosition(data.x, data.y);
//   };

//   // Map gyroscope values to the range between -50% and +50% of the screen width/height
//   const mapGyroscopeToScreen = (value, minInput, maxInput) => {
//     if (value === null || isNaN(value)) return 0; // Default to the center
//     const mappedValue =
//       ((value - minInput) * (50 - -50)) / (maxInput - minInput) + -50;
//     return Math.max(-50, Math.min(mappedValue, 50)); // Ensure it stays within bounds
//   };

//   const ballXPercent =
//     isSmallToggled1 && !isDragging
//       ? mapGyroscopeToScreen(orientation?.gamma, -60, 60)
//       : ballPosition.x;

//   const ballYPercent =
//     isSmallToggled2 && !isDragging
//       ? mapGyroscopeToScreen(orientation?.beta, -45, 45)
//       : ballPosition.y;

//   // Format values to have 2 digits after the comma
//   const formatValue = (value) => (value !== null ? value.toFixed(2) : "0.00");

//   return (
//     <div className="mobile-container">
//       {/* Draggable Logs */}
//       <Draggable>
//         <div className="log-container">
//           <ul>
//             <li>ɑ: {formatValue(orientation.alpha)}</li>
//             <li>β: {formatValue(orientation.beta)}</li>
//             <li>γ: {formatValue(orientation.gamma)}</li>
//             <li>X-axis: {ballXPercent.toFixed(2)}</li> {/* Log X-axis */}
//             <li>Y-axis: {ballYPercent.toFixed(2)}</li> {/* Log Y-axis */}
//             <li>{lastEvent}</li> {/* Display last event log here */}
//           </ul>
//         </div>
//       </Draggable>

//       {/* Large Circle that acts as a toggle button */}
//       <div
//         className={`large-circle ${isLargeToggled ? "toggled" : ""}`}
//         onClick={handleLargeToggleClick} // Toggle tracking on click
//       >
//         {/* X and Y axis lines */}
//         {isLargeToggled && (
//           <>
//             <div className="x-axis-line"></div>
//             <div className="y-axis-line"></div>
//           </>
//         )}
//         {isLargeToggled && <div className="inner-circle"></div>}
//       </div>

//       {/* Small Ball moves based on orientation within the full screen */}
//       <Draggable
//         position={ballPosition}
//         positionOffset={{ x: "-0.7rem", y: "-0.7rem" }} // Shift the ball slightly
//         onStart={handleStartDrag}
//         onStop={handleStopDrag}
//         onDrag={handleDrag}
//       >
//         <div
//           className="small-ball"
//           style={{
//             left: !isDragging ? `calc(50% + ${ballXPercent}%)` : undefined,
//             top: !isDragging ? `calc(50% + ${ballYPercent}%)` : undefined,
//             transform: `translate(-50%, -50%)`, // Ensures the center of the ball aligns with the cross
//             position: isDragging ? "absolute" : "fixed",
//           }}
//         ></div>
//       </Draggable>

//       {/* Faders on the top-left part */}
//       <div className="faders-container">
//         <FadersGroup
//           faders={FadersDictionary}
//           values={faderValues}
//           handleChange={handleFaderChange}
//         />
//       </div>

//       {/* Bottom buttons: Clear Glitch and four small toggle buttons */}
//       <div className="bottom-buttons">
//         <div
//           className={`clear-glitch-button ${isClearGlitch ? "pressed" : ""}`}
//           onMouseDown={handleClearGlitchStart}
//           onMouseUp={handleClearGlitchEnd}
//           onTouchStart={handleClearGlitchStart}
//           onTouchEnd={handleClearGlitchEnd}
//         ></div>

//         <div
//           className={`small-toggle-button ${isSmallToggled1 ? "active" : ""}`}
//           onClick={handleSmallToggleClick1}
//           style={{ opacity: isSmallToggled1 ? 1 : 0.2 }}
//         ></div>

//         <div
//           className={`small-toggle-button ${isSmallToggled2 ? "active" : ""}`}
//           onClick={handleSmallToggleClick2}
//           style={{ opacity: isSmallToggled2 ? 1 : 0.2 }}
//         ></div>

//         <div
//           className={`small-toggle-button ${isSmallToggled3 ? "active" : ""}`}
//           onClick={handleSmallToggleClick3}
//         ></div>

//         <div
//           className={`small-toggle-button ${isSmallToggled4 ? "active" : ""}`}
//           onClick={handleSmallToggleClick4}
//         ></div>
//       </div>
//     </div>
//   );
// }

// import "../Mobile/AppMobile.css";
// import { useState, useEffect } from "react";
// import Draggable from "react-draggable"; // Import Draggable library
// import "@fontsource/roboto"; // Import Roboto font
// import { useDeviceOrientation } from "../../hooks/useDeviceOrientation"; // Import your hook

// export default function AppMobile() {
//   const { orientation, requestAccess, revokeAccess, error } =
//     useDeviceOrientation(); // Use the hook
//   const [isTracking, setIsTracking] = useState(false);
//   const [isLargeToggled, setIsLargeToggled] = useState(false); // State for large button
//   const [isSmallToggled1, setIsSmallToggled1] = useState(true); // X-axis toggle (default to enabled)
//   const [isSmallToggled2, setIsSmallToggled2] = useState(true); // Y-axis toggle (default to enabled)
//   const [isSmallToggled3, setIsSmallToggled3] = useState(true); // Additional toggle button
//   const [isSmallToggled4, setIsSmallToggled4] = useState(true); // Additional toggle button
//   const [isClearGlitch, setIsClearGlitch] = useState(false); // State for Clear Glitch button
//   const [lastEvent, setLastEvent] = useState(""); // Store the last event
//   const [isDragging, setIsDragging] = useState(false); // State for dragging
//   const [ballPosition, setBallPosition] = useState({ x: 0, y: 0 }); // Store the current ball position

//   const handleSmallToggleClick1 = () => {
//     setIsSmallToggled1((prev) => !prev);
//     setLastEvent(`X-Axis ${isSmallToggled1 ? "Off" : "On"}`);
//   };

//   const handleSmallToggleClick2 = () => {
//     setIsSmallToggled2((prev) => !prev);
//     setLastEvent(`Y-Axis ${isSmallToggled2 ? "Off" : "On"}`);
//   };

//   const handleSmallToggleClick3 = () => {
//     setIsSmallToggled3((prev) => !prev);
//     setLastEvent(`Toggle 1 ${isSmallToggled3 ? "Off" : "On"}`);
//   };

//   const handleSmallToggleClick4 = () => {
//     setIsSmallToggled4((prev) => !prev);
//     setLastEvent(`Toggle 2 ${isSmallToggled4 ? "Off" : "On"}`);
//   };

//   // Handle toggling the large button (which is the circle now)
//   const handleLargeToggleClick = async (event) => {
//     event.preventDefault();
//     setIsLargeToggled((prev) => {
//       const newState = !prev;
//       if (newState) {
//         requestAccess(); // Start tracking
//         setIsTracking(true);
//       } else {
//         revokeAccess(); // Stop tracking
//         setIsTracking(false);
//       }
//       setLastEvent(`Circle ${newState ? "On" : "Off"}`);
//       return newState;
//     });
//   };

//   // Handle Clear Glitch button start and end
//   const handleClearGlitchStart = () => {
//     setIsClearGlitch(true);
//     setLastEvent("Clear Glitch");
//   };

//   const handleClearGlitchEnd = () => {
//     setIsClearGlitch(false);
//   };

//   // Update the logs with the ball's position
//   const updateLogWithPosition = (x, y) => {
//     setLastEvent(`Ball Position - X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}`);
//   };

//   // Handle the start of dragging
//   const handleStartDrag = () => {
//     setIsDragging(true);
//   };

//   // Handle the stop of dragging
//   const handleStopDrag = () => {
//     setIsDragging(false);
//     // Reset the ball position to center (0, 0)
//     setBallPosition({ x: 0, y: 0 });
//     updateLogWithPosition(0, 0); // Log reset to center
//   };

//   // Handle dragging event
//   const handleDrag = (e, data) => {
//     setBallPosition({ x: data.x, y: data.y });
//     // updateLogWithPosition(data.x, data.y);
//   };

//   // Map gyroscope values to the range between -50% and +50% of the screen width/height
//   const mapGyroscopeToScreen = (value, minInput, maxInput) => {
//     if (value === null || isNaN(value)) return 0; // Default to the center
//     const mappedValue =
//       ((value - minInput) * (50 - -50)) / (maxInput - minInput) + -50;
//     return Math.max(-50, Math.min(mappedValue, 50)); // Ensure it stays within bounds
//   };

//   const ballXPercent =
//     isSmallToggled1 && !isDragging
//       ? mapGyroscopeToScreen(orientation?.gamma, -60, 60)
//       : ballPosition.x;

//   const ballYPercent =
//     isSmallToggled2 && !isDragging
//       ? mapGyroscopeToScreen(orientation?.beta, -45, 45)
//       : ballPosition.y;

//   // Format values to have 2 digits after the comma
//   const formatValue = (value) => (value !== null ? value.toFixed(2) : "0.00");

//   return (
//     <div className="mobile-container">
//       {/* Draggable Logs */}
//       <Draggable>
//         <div className="log-container">
//           <ul>
//             <li>ɑ: {formatValue(orientation.alpha)}</li>
//             <li>β: {formatValue(orientation.beta)}</li>
//             <li>γ: {formatValue(orientation.gamma)}</li>
//             <li>X-axis: {ballXPercent.toFixed(2)}</li> {/* Log X-axis */}
//             <li>Y-axis: {ballYPercent.toFixed(2)}</li> {/* Log Y-axis */}
//             <li>{lastEvent}</li> {/* Display last event log here */}
//           </ul>
//         </div>
//       </Draggable>

//       {/* Large Circle that acts as a toggle button */}
//       <div
//         className={`large-circle ${isLargeToggled ? "toggled" : ""}`}
//         onClick={handleLargeToggleClick} // Toggle tracking on click
//       >
//         {/* X and Y axis lines */}
//         {isLargeToggled && (
//           <>
//             <div className="x-axis-line"></div>
//             <div className="y-axis-line"></div>
//           </>
//         )}
//         {isLargeToggled && <div className="inner-circle"></div>}
//       </div>

//       {/* Small Ball moves based on orientation within the full screen */}
//       <Draggable
//         position={ballPosition}
//         positionOffset={{ x: "-0.7rem", y: "-0.7rem" }} // Shift the ball slightly
//         onStart={handleStartDrag}
//         onStop={handleStopDrag}
//         onDrag={handleDrag}
//       >
//         <div
//           className="small-ball"
//           style={{
//             left: !isDragging ? `calc(50% + ${ballXPercent}%)` : undefined,
//             top: !isDragging ? `calc(50% + ${ballYPercent}%)` : undefined,
//             transform: `translate(-50%, -50%)`, // Ensures the center of the ball aligns with the cross
//             position: isDragging ? "absolute" : "fixed",
//           }}
//         ></div>
//       </Draggable>

//       {/* Bottom buttons: Clear Glitch and four small toggle buttons */}
//       <div className="bottom-buttons">
//         <div
//           className={`clear-glitch-button ${isClearGlitch ? "pressed" : ""}`}
//           onMouseDown={handleClearGlitchStart}
//           onMouseUp={handleClearGlitchEnd}
//           onTouchStart={handleClearGlitchStart}
//           onTouchEnd={handleClearGlitchEnd}
//         ></div>

//         <div
//           className={`small-toggle-button ${isSmallToggled1 ? "active" : ""}`}
//           onClick={handleSmallToggleClick1}
//           style={{ opacity: isSmallToggled1 ? 1 : 0.2 }}
//         ></div>

//         <div
//           className={`small-toggle-button ${isSmallToggled2 ? "active" : ""}`}
//           onClick={handleSmallToggleClick2}
//           style={{ opacity: isSmallToggled2 ? 1 : 0.2 }}
//         ></div>

//         <div
//           className={`small-toggle-button ${isSmallToggled3 ? "active" : ""}`}
//           onClick={handleSmallToggleClick3}
//         ></div>

//         <div
//           className={`small-toggle-button ${isSmallToggled4 ? "active" : ""}`}
//           onClick={handleSmallToggleClick4}
//         ></div>
//       </div>
//     </div>
//   );
// }

// import "../Mobile/AppMobile.css";
// import { useState } from "react";
// import Draggable from "react-draggable"; // Import Draggable library
// import "@fontsource/roboto"; // Import Roboto font
// import { useDeviceOrientation } from "../../hooks/useDeviceOrientation"; // Import your hook

// export default function AppMobile() {
//   const { orientation, requestAccess, revokeAccess, error } =
//     useDeviceOrientation(); // Use the hook
//   const [isTracking, setIsTracking] = useState(false);
//   const [isLargeToggled, setIsLargeToggled] = useState(false); // State for large button
//   const [isSmallToggled1, setIsSmallToggled1] = useState(true); // X-axis toggle (default to enabled)
//   const [isSmallToggled2, setIsSmallToggled2] = useState(true); // Y-axis toggle (default to enabled)
//   const [isSmallToggled3, setIsSmallToggled3] = useState(true); // Additional toggle button
//   const [isSmallToggled4, setIsSmallToggled4] = useState(true); // Additional toggle button
//   const [isClearGlitch, setIsClearGlitch] = useState(false); // State for Clear Glitch button
//   const [lastEvent, setLastEvent] = useState(""); // Store the last event
//   const [isDragging, setIsDragging] = useState(false); // State for dragging
//   const [ballPosition, setBallPosition] = useState({ x: 0, y: 0 }); // Store the current ball position

//   const handleSmallToggleClick1 = () => {
//     setIsSmallToggled1((prev) => !prev);
//     setLastEvent(`X-Axis ${isSmallToggled1 ? "Off" : "On"}`);
//   };

//   const handleSmallToggleClick2 = () => {
//     setIsSmallToggled2((prev) => !prev);
//     setLastEvent(`Y-Axis ${isSmallToggled2 ? "Off" : "On"}`);
//   };

//   const handleSmallToggleClick3 = () => {
//     setIsSmallToggled3((prev) => !prev);
//     setLastEvent(`Toggle 1 ${isSmallToggled3 ? "Off" : "On"}`);
//   };

//   const handleSmallToggleClick4 = () => {
//     setIsSmallToggled4((prev) => !prev);
//     setLastEvent(`Toggle 2 ${isSmallToggled4 ? "Off" : "On"}`);
//   };

//   // Handle toggling the large button (which is the circle now)
//   const handleLargeToggleClick = async (event) => {
//     event.preventDefault();
//     setIsLargeToggled((prev) => {
//       const newState = !prev;
//       if (newState) {
//         requestAccess(); // Start tracking
//         setIsTracking(true);
//       } else {
//         revokeAccess(); // Stop tracking
//         setIsTracking(false);
//       }
//       setLastEvent(`Circle ${newState ? "On" : "Off"}`);
//       return newState;
//     });
//   };

//   // Handle Clear Glitch button start and end
//   const handleClearGlitchStart = () => {
//     setIsClearGlitch(true);
//     setLastEvent("Clear Glitch");
//   };

//   const handleClearGlitchEnd = () => {
//     setIsClearGlitch(false);
//   };

//   // Update the logs with the ball's position
//   const updateLogWithPosition = (x, y) => {
//     setLastEvent(`Ball Position - X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}`);
//   };

//   // Handle the start of dragging
//   const handleStartDrag = () => {
//     setIsDragging(true);
//   };

//   // Handle the stop of dragging
//   const handleStopDrag = () => {
//     setIsDragging(false);
//     // Reset the ball position to center (0, 0)
//     setBallPosition({ x: 0, y: 0 });
//     updateLogWithPosition(0, 0); // Log reset to center
//   };

//   // Handle dragging event
//   const handleDrag = (e, data) => {
//     setBallPosition({ x: data.x, y: data.y });
//     updateLogWithPosition(data.x, data.y);
//   };

//   // Map gyroscope values to the range between 0 and 100% of the screen width and height
//   const mapGyroscopeToScreen = (value, minInput, maxInput) => {
//     if (value === null || isNaN(value)) return 50; // Default to the center
//     const mappedValue =
//       ((value - minInput) * (100 - 0)) / (maxInput - minInput) + 0;
//     return Math.max(0, Math.min(mappedValue, 100)); // Ensure it stays within 0% to 100%
//   };

//   const ballXPercent = isSmallToggled1
//     ? mapGyroscopeToScreen(orientation?.gamma, -60, 60)
//     : 50; // Lock to center when disabled

//   const ballYPercent = isSmallToggled2
//     ? mapGyroscopeToScreen(orientation?.beta, -45, 45)
//     : 50; // Lock to center when disabled

//   // Format values to have 2 digits after the comma
//   const formatValue = (value) => (value !== null ? value.toFixed(2) : "0.00");

//   return (
//     <div className="mobile-container">
//       {/* Draggable Logs */}
//       <Draggable>
//         <div className="log-container">
//           <ul>
//             <li>ɑ: {formatValue(orientation.alpha)}</li>
//             <li>β: {formatValue(orientation.beta)}</li>
//             <li>γ: {formatValue(orientation.gamma)}</li>
//             <li>X-axis: {ballPosition.x.toFixed(2)}</li> {/* Log X-axis */}
//             <li>Y-axis: {ballPosition.y.toFixed(2)}</li> {/* Log Y-axis */}
//             <li>{lastEvent}</li> {/* Display last event log here */}
//           </ul>
//         </div>
//       </Draggable>

//       {/* Large Circle that acts as a toggle button */}
//       <div
//         className={`large-circle ${isLargeToggled ? "toggled" : ""}`}
//         onClick={handleLargeToggleClick} // Toggle tracking on click
//       >
//         {/* X and Y axis lines */}
//         {isLargeToggled && (
//           <>
//             <div className="x-axis-line"></div>
//             <div className="y-axis-line"></div>
//           </>
//         )}

//         {/* Inner Circle */}
//         {isLargeToggled && <div className="inner-circle"></div>}
//       </div>

//       {/* Small Ball moves based on orientation within the full screen */}
//       {/* <div
//         className="small-ball"
//         style={{
//           left: `${ballXPercent}%`,
//           top: `${ballYPercent}%`,
//         }}
//       ></div> */}
//       <Draggable
//         position={ballPosition}
//         onStart={handleStartDrag}
//         onStop={handleStopDrag}
//         onDrag={handleDrag}
//       >
//         <div
//           className="small-ball"
//           style={{
//             left: !isDragging ? `${ballXPercent}%` : undefined,
//             top: !isDragging ? `${ballYPercent}%` : undefined,
//             transform: isDragging ? "none" : `translate(-50%, -50%)`,
//             position: isDragging ? "absolute" : "fixed",
//           }}
//         ></div>
//       </Draggable>

//       {/* Bottom buttons: Clear Glitch and four small toggle buttons */}
//       <div className="bottom-buttons">
//         <div
//           className={`clear-glitch-button ${isClearGlitch ? "pressed" : ""}`}
//           onMouseDown={handleClearGlitchStart}
//           onMouseUp={handleClearGlitchEnd}
//           onTouchStart={handleClearGlitchStart}
//           onTouchEnd={handleClearGlitchEnd}
//         ></div>

//         <div
//           className={`small-toggle-button ${isSmallToggled1 ? "active" : ""}`}
//           onClick={handleSmallToggleClick1}
//           style={{ opacity: isSmallToggled1 ? 1 : 0.2 }}
//         ></div>

//         <div
//           className={`small-toggle-button ${isSmallToggled2 ? "active" : ""}`}
//           onClick={handleSmallToggleClick2}
//           style={{ opacity: isSmallToggled2 ? 1 : 0.2 }}
//         ></div>

//         <div
//           className={`small-toggle-button ${isSmallToggled3 ? "active" : ""}`}
//           onClick={handleSmallToggleClick3}
//         ></div>

//         <div
//           className={`small-toggle-button ${isSmallToggled4 ? "active" : ""}`}
//           onClick={handleSmallToggleClick4}
//         ></div>
//       </div>
//     </div>
//   );
// }

// // ----- Mobile original version ----
// import "../Mobile/AppMobile.css";
// import { useState } from "react";
// import Draggable from "react-draggable"; // Import Draggable library
// import "@fontsource/roboto"; // Import Roboto font
// import { useDeviceOrientation } from "../../hooks/useDeviceOrientation"; // Import your hook

// export default function AppMobile() {
//   const { orientation, requestAccess, revokeAccess, error } =
//     useDeviceOrientation(); // Use the hook
//   const [isTracking, setIsTracking] = useState(false);
//   const [isLargeToggled, setIsLargeToggled] = useState(false); // State for large button
//   const [isSmallToggled1, setIsSmallToggled1] = useState(true); // X-axis toggle (default to enabled)
//   const [isSmallToggled2, setIsSmallToggled2] = useState(true); // Y-axis toggle (default to enabled)
//   const [isSmallToggled3, setIsSmallToggled3] = useState(true); // Additional toggle button
//   const [isSmallToggled4, setIsSmallToggled4] = useState(true); // Additional toggle button
//   const [isClearGlitch, setIsClearGlitch] = useState(false); // State for Clear Glitch button
//   const [lastEvent, setLastEvent] = useState(""); // Store the last event

//   const handleSmallToggleClick1 = () => {
//     setIsSmallToggled1((prev) => !prev);
//     setLastEvent(`X-Axis ${isSmallToggled1 ? "Off" : "On"}`);
//   };

//   const handleSmallToggleClick2 = () => {
//     setIsSmallToggled2((prev) => !prev);
//     setLastEvent(`Y-Axis ${isSmallToggled2 ? "Off" : "On"}`);
//   };

//   const handleSmallToggleClick3 = () => {
//     setIsSmallToggled3((prev) => !prev);
//     setLastEvent(`Toggle 1 ${isSmallToggled3 ? "Off" : "On"}`);
//   };

//   const handleSmallToggleClick4 = () => {
//     setIsSmallToggled4((prev) => !prev);
//     setLastEvent(`Toggle 2 ${isSmallToggled4 ? "Off" : "On"}`);
//   };

//   // Handle toggling the large button (which is the circle now)
//   const handleLargeToggleClick = async (event) => {
//     event.preventDefault();
//     setIsLargeToggled((prev) => {
//       const newState = !prev;
//       if (newState) {
//         requestAccess(); // Start tracking
//         setIsTracking(true);
//       } else {
//         revokeAccess(); // Stop tracking
//         setIsTracking(false);
//       }
//       setLastEvent(`Circle ${newState ? "On" : "Off"}`);
//       return newState;
//     });
//   };

//   // Handle Clear Glitch button start and end
//   const handleClearGlitchStart = () => {
//     setIsClearGlitch(true);
//     setLastEvent("Clear Glitch");
//   };

//   const handleClearGlitchEnd = () => {
//     setIsClearGlitch(false);
//   };

//   // Map gyroscope values to the range between 0 and 100% of the screen width and height
//   const mapGyroscopeToScreen = (value, minInput, maxInput) => {
//     if (value === null || isNaN(value)) return 50; // Default to the center
//     const mappedValue =
//       ((value - minInput) * (100 - 0)) / (maxInput - minInput) + 0;
//     return Math.max(0, Math.min(mappedValue, 100)); // Ensure it stays within 0% to 100%
//   };

//   const ballXPercent = isSmallToggled1
//     ? mapGyroscopeToScreen(orientation?.gamma, -60, 60)
//     : 50; // Lock to center when disabled

//   const ballYPercent = isSmallToggled2
//     ? mapGyroscopeToScreen(orientation?.beta, -45, 45)
//     : 50; // Lock to center when disabled

//   // Format values to have 2 digits after the comma
//   const formatValue = (value) => (value !== null ? value.toFixed(2) : "0.00");

//   return (
//     <div className="mobile-container">
//       {/* Draggable Logs */}
//       <Draggable>
//         <div className="log-container">
//           <ul>
//             <li>ɑ: {formatValue(orientation.alpha)}</li>
//             <li>β: {formatValue(orientation.beta)}</li>
//             <li>γ: {formatValue(orientation.gamma)}</li>
//             <li>{lastEvent}</li> {/* Display last event log here */}
//           </ul>
//         </div>
//       </Draggable>

//       {/* Large Circle that acts as a toggle button */}
//       <div
//         className={`large-circle ${isLargeToggled ? "toggled" : ""}`}
//         onClick={handleLargeToggleClick} // Toggle tracking on click
//       >
//         {/* X and Y axis lines */}
//         {isLargeToggled && (
//           <>
//             <div className="x-axis-line"></div>
//             <div className="y-axis-line"></div>
//           </>
//         )}

//         {/* Inner Circle */}
//         {isLargeToggled && <div className="inner-circle"></div>}
//       </div>

//       {/* Small Ball moves based on orientation within the full screen */}
//       <div
//         className="small-ball"
//         style={{
//           left: `${ballXPercent}%`,
//           top: `${ballYPercent}%`,
//         }}
//       ></div>

//       {/* Bottom buttons: Clear Glitch and four small toggle buttons */}
//       <div className="bottom-buttons">
//         <div
//           className={`clear-glitch-button ${isClearGlitch ? "pressed" : ""}`}
//           onMouseDown={handleClearGlitchStart}
//           onMouseUp={handleClearGlitchEnd}
//           onTouchStart={handleClearGlitchStart}
//           onTouchEnd={handleClearGlitchEnd}
//         ></div>

//         <div
//           className={`small-toggle-button ${isSmallToggled1 ? "active" : ""}`}
//           onClick={handleSmallToggleClick1}
//           style={{ opacity: isSmallToggled1 ? 1 : 0.2 }}
//         ></div>

//         <div
//           className={`small-toggle-button ${isSmallToggled2 ? "active" : ""}`}
//           onClick={handleSmallToggleClick2}
//           style={{ opacity: isSmallToggled2 ? 1 : 0.2 }}
//         ></div>

//         <div
//           className={`small-toggle-button ${isSmallToggled3 ? "active" : ""}`}
//           onClick={handleSmallToggleClick3}
//         ></div>

//         <div
//           className={`small-toggle-button ${isSmallToggled4 ? "active" : ""}`}
//           onClick={handleSmallToggleClick4}
//         ></div>
//       </div>
//     </div>
//   );
// }

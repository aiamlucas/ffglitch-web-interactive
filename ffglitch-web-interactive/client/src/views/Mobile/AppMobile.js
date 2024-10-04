// client/views/Mobile/AppMobile.js
import "../Mobile/AppMobile.css";
import { useState, useEffect } from "react";
import Draggable from "react-draggable";
import "@fontsource/roboto";
import { useDeviceOrientation } from "../../hooks/useDeviceOrientation";
import FadersGroup from "../../components/FadersGroup/FadersGroup";
import io from "socket.io-client";

// Establish the socket connection
const socket = io.connect(`https://${window.location.hostname}:3001`, {
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

const FadersDictionary = generateItemsDictionary(1, "fader");

export default function AppMobile() {
  const { orientation, requestAccess, revokeAccess, error } =
    useDeviceOrientation();
  const [isTracking, setIsTracking] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isGyroscopeActive, setIsGyroscopeActive] = useState(false); // Add this state
  const [manualReset, setManualReset] = useState(false);
  const [isKeyboardControl, setIsKeyboardControl] = useState(false);
  const [showClearLog, setShowClearLog] = useState(false);
  const [lastEvent, setLastEvent] = useState("");
  const [ballPosition, setBallPosition] = useState({ x: 0, y: 0 });
  const [faderValues, setFaderValues] = useState(
    Array(FadersDictionary.length).fill(0)
  );
  // const [buttonValues, setButtonValues] = useState([0, 1, 1, 0, 0, 0]); // for extended version of the app
  const [buttonValues, setButtonValues] = useState([0, 0, 0, 0]);

  // const handleButtonToggle = (index, isPressed) => {
  //   const updatedButtonValues = [...buttonValues];

  //   if (index === 3) {
  //     // Handle the second button as a push button for gyroscope
  //     if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
  //       if (isPressed) {
  //         requestAccess(); // Request permission for Device Orientation
  //         setIsTracking(true);
  //         setIsGyroscopeActive(true); // Activate gyroscope and inner circle
  //         socket.emit("gyroscope_state_change", true);
  //         console.log("Gyroscope tracking started");
  //       } else {
  //         revokeAccess(); // Stop gyroscope tracking when released
  //         setIsTracking(false);
  //         setIsGyroscopeActive(false); // Deactivate gyroscope and inner circle
  //         socket.emit("gyroscope_state_change", false);
  //         console.log("Gyroscope tracking stopped");
  //       }
  //     } else {
  //       console.log("DeviceOrientationEvent is not supported on this device.");
  //     }
  //   } else {
  //     // Handle other button toggles (like Clear, Keyboard, etc.)
  //     updatedButtonValues[index] = updatedButtonValues[index] === 0 ? 1 : 0;
  //     const buttonName = `button${index + 1}`;
  //     socket.emit("send_toggle_value", {
  //       toggle: buttonName,
  //       value: updatedButtonValues[index],
  //     });

  //     switch (index) {
  //       case 0:
  //         socket.emit("broadcast_log", "Clear");
  //         break;
  //       case 1:
  //         setIsKeyboardControl(updatedButtonValues[1] === 1);
  //         socket.emit(
  //           "broadcast_log",
  //           `Keyboard: ${updatedButtonValues[1] ? "On" : "Off"}`
  //         );
  //         break;
  //       default:
  //         break;
  //     }
  //   }

  //   setButtonValues(updatedButtonValues);
  //   console.log(`Button ${index + 1} toggled to ${updatedButtonValues[index]}`);
  // };

  const handleButtonToggle = (index, isPressed) => {
    const updatedButtonValues = [...buttonValues];

    if (index === 3) {
      // Handle the second button as a push button for gyroscope
      if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
        if (isPressed) {
          requestAccess(); // Request permission for Device Orientation
          setIsTracking(true);
          setIsGyroscopeActive(true); // Activate gyroscope and inner circle
          socket.emit("gyroscope_state_change", true);
          console.log("Gyroscope tracking started");
        } else {
          revokeAccess(); // Stop gyroscope tracking when released
          setIsTracking(false);
          setIsGyroscopeActive(false); // Deactivate gyroscope and inner circle
          socket.emit("gyroscope_state_change", false);
          console.log("Gyroscope tracking stopped");
        }
      } else {
        console.log("DeviceOrientationEvent is not supported on this device.");
      }
    } else {
      // Handle other button toggles (like Clear, Keyboard, etc.)
      updatedButtonValues[index] = updatedButtonValues[index] === 0 ? 1 : 0;
      const buttonName = `button${index + 1}`;
      socket.emit("send_toggle_value", {
        toggle: buttonName,
        value: updatedButtonValues[index],
      });

      switch (index) {
        case 0:
          socket.emit("broadcast_log", "Clear");
          break;
        case 1:
          setIsKeyboardControl(updatedButtonValues[1] === 1);
          socket.emit(
            "broadcast_log",
            `Keyboard: ${updatedButtonValues[1] ? "On" : "Off"}`
          );
          break;
        default:
          break;
      }
    }

    setButtonValues(updatedButtonValues);
    console.log(`Button ${index + 1} toggled to ${updatedButtonValues[index]}`);
  };

  // const handleButtonToggle = (index) => {
  //   const updatedButtonValues = [...buttonValues];
  //   updatedButtonValues[index] = buttonValues[index] === 0 ? 1 : 0;

  //   // Emit the toggle event to the server
  //   const buttonName = `button${index + 1}`;
  //   socket.emit("send_toggle_value", {
  //     toggle: buttonName,
  //     value: updatedButtonValues[index],
  //   });

  //   switch (index) {
  //     case 0:
  //       socket.emit("broadcast_log", "Clear");
  //       break;

  //     case 1:
  //       // Set isKeyboardControl here
  //       setIsKeyboardControl(updatedButtonValues[1] === 1);
  //       socket.emit(
  //         "broadcast_log",
  //         `Keyboard: ${updatedButtonValues[1] ? "On" : "Off"}`
  //       );
  //       break;

  //     case 2: // Large circle, control tracking
  //       if (
  //         typeof window !== "undefined" &&
  //         "DeviceOrientationEvent" in window
  //       ) {
  //         if (updatedButtonValues[2]) {
  //           // Request permission for Device Orientation
  //           requestAccess(); // Request permission from the user
  //           setIsTracking(true);
  //           setIsGyroscopeActive(true); // Set gyroscope as active (for the css animation)

  //           socket.emit("gyroscope_state_change", true);
  //           console.log("Gyroscope tracking started");
  //         } else {
  //           revokeAccess(); // Stop gyroscope tracking
  //           setIsTracking(false);
  //           setIsGyroscopeActive(false); // Set gyroscope as inactive (for the css animation)

  //           socket.emit("gyroscope_state_change", false);
  //           console.log("Gyroscope tracking stopped");
  //         }
  //       } else {
  //         console.log(
  //           "DeviceOrientationEvent is not supported in this browser."
  //         );
  //       }
  //       break;
  //     default:
  //       break;
  //   }

  //   setButtonValues(updatedButtonValues);
  //   console.log(`Button ${index + 1} toggled to ${updatedButtonValues[index]}`);
  // };

  // const handleButtonToggle = (index, isPressed) => {
  //   const updatedButtonValues = [...buttonValues];

  //   // Handle the large circle (index 2) as a push button
  //   if (index === 2) {
  //     if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
  //       if (isPressed) {
  //         requestAccess(); // Request permission for Device Orientation
  //         setIsTracking(true);
  //         setIsGyroscopeActive(true); // Set gyroscope as active (CSS animation)
  //         socket.emit("gyroscope_state_change", true);
  //         console.log("Gyroscope tracking started");
  //       } else {
  //         revokeAccess(); // Stop gyroscope tracking when button is released
  //         setIsTracking(false);
  //         setIsGyroscopeActive(false); // Set gyroscope as inactive
  //         socket.emit("gyroscope_state_change", false);
  //         console.log("Gyroscope tracking stopped");
  //       }
  //     } else {
  //       console.log("DeviceOrientationEvent is not supported in this browser.");
  //     }
  //   } else {
  //     // Handle regular toggle for other buttons
  //     updatedButtonValues[index] = updatedButtonValues[index] === 0 ? 1 : 0;

  //     // Emit the toggle event to the server
  //     const buttonName = `button${index + 1}`;
  //     socket.emit("send_toggle_value", {
  //       toggle: buttonName,
  //       value: updatedButtonValues[index],
  //     });

  //     switch (index) {
  //       case 0:
  //         socket.emit("broadcast_log", "Clear");
  //         break;

  //       case 1:
  //         // Set isKeyboardControl here
  //         setIsKeyboardControl(updatedButtonValues[1] === 1);
  //         socket.emit(
  //           "broadcast_log",
  //           `Keyboard: ${updatedButtonValues[1] ? "On" : "Off"}`
  //         );
  //         break;

  //       default:
  //         break;
  //     }
  //   }

  //   setButtonValues(updatedButtonValues);
  //   console.log(`Button ${index + 1} toggled to ${updatedButtonValues[index]}`);
  // };

  /////////////////////////////////////////////
  // // Extended version (x-axis, y-axis, AMV as toggle buttons) // still in development

  // const handleButtonToggle = (index) => {
  //   const updatedButtonValues = [...buttonValues];
  //   updatedButtonValues[index] = buttonValues[index] === 0 ? 1 : 0;

  //   // Emit the toggle event to the server
  //   const buttonName = `button${index + 1}`;
  //   socket.emit("send_toggle_value", {
  //     toggle: buttonName,
  //     value: updatedButtonValues[index],
  //   });

  //   switch (index) {
  //     case 0:
  //       socket.emit("broadcast_log", "Clear Glitch");
  //       break;
  //     case 1:
  //       socket.emit(
  //         "broadcast_log",
  //         `X-axis: ${updatedButtonValues[1] ? "On" : "Off"}`
  //       );
  //       break;
  //     case 2:
  //       socket.emit(
  //         "broadcast_log",
  //         `Y-axis: ${updatedButtonValues[2] ? "On" : "Off"}`
  //       );
  //       break;
  //     case 3:
  //       socket.emit(
  //         "broadcast_log",
  //         `AMV: ${updatedButtonValues[3] ? "On" : "Off"}`
  //       );
  //       break;
  //     case 4:
  //       // Set isKeyboardControl here
  //       setIsKeyboardControl(updatedButtonValues[4] === 1);
  //       socket.emit(
  //         "broadcast_log",
  //         `Keyboard Control: ${updatedButtonValues[4] ? "On" : "Off"}`
  //       );
  //       break;
  //     case 5: // Large circle, control tracking
  //       if (
  //         typeof window !== "undefined" &&
  //         "DeviceOrientationEvent" in window
  //       ) {
  //         if (updatedButtonValues[5]) {
  //           requestAccess(); // Start gyroscope tracking
  //           setIsTracking(true);
  //           console.log("Gyroscope tracking started");
  //         } else {
  //           revokeAccess(); // Stop gyroscope tracking
  //           setIsTracking(false);
  //           console.log("Gyroscope tracking stopped");
  //         }
  //       } else {
  //         console.log(
  //           "DeviceOrientationEvent is not supported in this browser."
  //         );
  //       }
  //       break;
  //     default:
  //       break;
  //   }

  //   setButtonValues(updatedButtonValues);
  //   console.log(`Button ${index + 1} toggled to ${updatedButtonValues[index]}`);
  // };
  /////////////////////////////////////////////

  const handleFaderChange = (index, value) => {
    // Emit the fader change to the server
    const faderName = `fader${index + 1}`;
    socket.emit("send_message", { fader: faderName, message: value });
  };

  const handleClearGlitchStart = () => {
    const updatedButtonValues = [...buttonValues];
    updatedButtonValues[0] = 1; // Push button (long press) at index 0
    setButtonValues(updatedButtonValues);

    socket.emit("broadcast_log", "Clear");
    socket.emit("send_toggle_value", { toggle: "button1", value: 1 });

    // Emit event to the server to trigger the Clear message on all clients
    socket.emit("show_clear_log", true); // Notify the server that Clear was pressed
    console.log("Clear Glitch button pressed");
  };

  // const handleClearGlitchStart = () => {
  //   const updatedButtonValues = [...buttonValues];
  //   updatedButtonValues[0] = 1; // Push button (long press) at index 0
  //   setButtonValues(updatedButtonValues);

  //   socket.emit("broadcast_log", "Clear");

  //   socket.emit("send_toggle_value", { toggle: "button1", value: 1 });

  //   socket.emit("show_clear_log", true); // Emit event to the server for all clients

  //   console.log("Clear Glitch button pressed");
  //   setShowClearLog(true);
  //   setTimeout(() => {
  //     setShowClearLog(false); // Hide "Clear" after 2 seconds
  //   }, 2000);
  // };

  const handleClearGlitchEnd = () => {
    const updatedButtonValues = [...buttonValues];
    updatedButtonValues[0] = 0; // Reset push button state
    setButtonValues(updatedButtonValues);

    socket.emit("send_toggle_value", { toggle: "button1", value: 0 });
    console.log("Clear Glitch button released");
  };

  const handleStartDrag = () => {
    setIsDragging(true);
    console.log("Drag started");
  };

  const handleStopDrag = () => {
    setIsDragging(false);
    setManualReset(true);
    const newPosition = { x: 0, y: 0 };
    setBallPosition(newPosition);
    socket.emit("ball_position_update", newPosition);
    setTimeout(() => {
      setManualReset(false);
    }, 500);

    console.log(`Drag stopped. Ball reset to (0, 0)`);
  };

  const handleDrag = (e, data) => {
    const newPosition = { x: data.x, y: data.y };
    setBallPosition(newPosition);

    // Emit the new position to the server
    socket.emit("ball_position_update", newPosition);
    console.log(`Ball dragged to: x=${newPosition.x}, y=${newPosition.y}`);
  };

  const mapGyroscopeToPixels = (
    value,
    minInput,
    maxInput,
    minOutput,
    maxOutput
  ) => {
    if (value === null || isNaN(value)) return 0; // Default to the center (0)

    // Map the gyroscope value to the pixel range (-200 to 200)
    const mappedValue =
      ((value - minInput) / (maxInput - minInput)) * (maxOutput - minOutput) +
      minOutput;

    // Clamp the value to stay within the range (-200 to 200)
    return Math.max(minOutput, Math.min(mappedValue, maxOutput));
  };

  useEffect(() => {
    const pixelRangeX = 200; // X-axis pixel range from -200 to 200
    const pixelRangeY = 300; // Y-axis pixel range from -300 to 300

    if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
      if (isTracking && !isDragging && !isKeyboardControl && !manualReset) {
        // Map gamma (X-axis) to pixel range (-200 to 200)
        const ballX = mapGyroscopeToPixels(
          orientation?.gamma,
          -90,
          90,
          -pixelRangeX,
          pixelRangeX
        );

        // Map beta (Y-axis) to pixel range (-200 to 200)
        const ballY = mapGyroscopeToPixels(
          orientation?.beta,
          -45,
          45,
          -pixelRangeY,
          pixelRangeY
        );

        const newPosition = { x: ballX, y: ballY };

        // Update the ball position and emit the position to the server
        setBallPosition(newPosition);
        socket.emit("ball_position_update", newPosition);
      }
    }
  }, [
    orientation.gamma,
    orientation.beta,
    isTracking,
    isDragging,
    isKeyboardControl,
    manualReset,
    ballPosition.x,
    ballPosition.y,
  ]);

  /////////////////////////////////////////////
  // // Extended version (x-axis, y-axis, AMV as toggle buttons) // still in development

  // Function to map gyroscope data to pixel values based on the screen dimensions
  // const mapGyroscopeToPixels = (value, minInput, maxInput, screenSize) => {
  //   if (value === null || isNaN(value)) return screenSize / 2; // Default to center of the screen
  //   const mappedValue =
  //     ((value - minInput) / (maxInput - minInput)) * screenSize; // Map to pixel range
  //   return Math.max(0, Math.min(mappedValue, screenSize)); // Ensure the values are within screen bounds
  // };

  // useEffect(() => {
  //   const { clientWidth, clientHeight } = document.documentElement; // Get screen size

  //   if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
  //     if (isTracking && !isDragging && !isKeyboardControl && !manualReset) {
  //       const x = buttonValues[1]
  //         ? mapGyroscopeToPixels(orientation?.gamma, -60, 60, clientWidth) // Map to screen width (in pixels)
  //         : ballPosition.x;
  //       const y = buttonValues[2]
  //         ? mapGyroscopeToPixels(orientation?.beta, -45, 45, clientHeight) // Map to screen height (in pixels)
  //         : ballPosition.y;

  //       const newPosition = { x, y };
  //       setBallPosition(newPosition);

  //       // Emit the new pixel-based position to the server
  //       socket.emit("ball_position_update", newPosition);

  //       console.log(`Gyroscope update: x=${x}px, y=${y}px`);
  //     }
  //   } else {
  //     console.log("DeviceOrientationEvent is not supported in this browser.");
  //   }
  // }, [
  //   orientation.gamma,
  //   orientation.beta,
  //   isTracking,
  //   isDragging,
  //   isKeyboardControl,
  //   manualReset,
  //   buttonValues,
  //   ballPosition.x,
  //   ballPosition.y,
  // ]);
  /////////////////////////////////////////////

  // Keyboard control effect
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isKeyboardControl) return;

      let deltaX = 0;
      let deltaY = 0;

      const moveAmount = 5; // Adjust the amount the ball moves per key press

      switch (event.key) {
        case "ArrowUp":
          deltaY = -moveAmount;
          break;
        case "ArrowDown":
          deltaY = moveAmount;
          break;
        case "ArrowLeft":
          deltaX = -moveAmount;
          break;
        case "ArrowRight":
          deltaX = moveAmount;
          break;
        default:
          return;
      }

      event.preventDefault();

      // Update the ball position
      const newPosition = {
        x: ballPosition.x + deltaX,
        y: ballPosition.y + deltaY,
      };

      console.log(
        `Key pressed: ${event.key}, New position: x=${newPosition.x}, y=${newPosition.y}`
      );

      setBallPosition(newPosition);
      socket.emit("ball_position_update", newPosition);
    };

    if (isKeyboardControl) {
      window.addEventListener("keydown", handleKeyDown);
      console.log("Keyboard control activated");
    } else {
      window.removeEventListener("keydown", handleKeyDown);
      console.log("Keyboard control deactivated");
    }

    // Clean up the event listener
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isKeyboardControl, ballPosition]);

  // Listen for ball position updates from the server
  useEffect(() => {
    socket.on("ball_position_update", (newPosition) => {
      // Update the ball's position
      setBallPosition(newPosition);
      console.log(
        `Received ball position update from server: x=${newPosition.x}, y=${newPosition.y}`
      );
    });

    // Clean up when the component unmounts
    return () => {
      socket.off("ball_position_update");
    };
  }, []);

  // Listen for initial fader values when the mobile client connects
  useEffect(() => {
    socket.on("initial_fader_values", (data) => {
      const initialValues = data.map((faderValue) => faderValue.value);
      setFaderValues(initialValues);
    });

    // Listen for updated fader values
    socket.on("updated_fader_values", (data) => {
      const updatedValues = data.map((faderValue) => faderValue.value);

      setFaderValues((prevFaderValues) => {
        // Compare and log only the fader that changed
        updatedValues.forEach((value, index) => {
          if (value !== prevFaderValues[index]) {
            // Use a switch statement to log different messages based on the index
            switch (index) {
              case 0:
                setLastEvent(`nb_frames: ${value}`);
                break;
              case 1:
                setLastEvent(`ma_frames: ${value}`);
                break;
              default:
                setLastEvent(`Fader${index + 1}: ${value}`);
                break;
            }
          }
        });

        return updatedValues;
      });
    });

    // Clean up when the component unmounts
    return () => {
      socket.off("initial_fader_values");
      socket.off("updated_fader_values");
    };
  }, []);

  // Listen for updated button values from the server
  useEffect(() => {
    socket.on("updated_toggle_values", (data) => {
      const updatedButtonValues = Object.values(data);
      setButtonValues(updatedButtonValues);
    });

    return () => {
      socket.off("updated_toggle_values");
    };
  }, []);

  // Listen for the log broadcast from the server
  useEffect(() => {
    socket.on("receive_log", (logMessage) => {
      setLastEvent(logMessage); // Update the log message for all clients
    });

    return () => {
      socket.off("receive_log");
    };
  }, []);

  // Listen for gyroscope state updates from the server
  useEffect(() => {
    socket.on("gyroscope_state_update", (state) => {
      setIsGyroscopeActive(state);
      console.log(`Gyroscope is now ${state ? "On" : "Off"}`);
    });

    return () => {
      socket.off("gyroscope_state_update");
    };
  }, []);

  // Listen for the "Clear" log broadcast from the server
  useEffect(() => {
    socket.on("receive_clear_log", (showClearLog) => {
      setShowClearLog(showClearLog); // Update the Clear log state for all clients
      // Automatically hide the "Clear" message after 2 seconds for all clients
      if (showClearLog) {
        setTimeout(() => {
          setShowClearLog(false); // Hide "Clear" after 2 seconds
        }, 2000);
      }
    });

    return () => {
      socket.off("receive_clear_log");
    };
  }, []);

  // Format values to have 2 digits after the decimal
  const formatValue = (value) => (value !== null ? value.toFixed(2) : "0.00");

  // Render the component
  return (
    <div className="mobile-container">
      {/* Draggable Logs */}
      <Draggable>
        <div className="log-container">
          <ul>
            {/* Log X and Y axis */}
            <li>X-axis: {ballPosition.x.toFixed(0)}</li>
            <li>Y-axis: {ballPosition.y.toFixed(0)}</li>
            <li>Gyroscope: {isGyroscopeActive ? "On" : "Off"}</li>
            {/* Conditional Clear log */}
            {showClearLog && <li>Clear</li>}
          </ul>
        </div>
      </Draggable>

      {/* Large Circle that acts as a push button */}
      <div
        className={`large-circle ${isGyroscopeActive ? "toggled" : ""}`}
        onMouseDown={() => handleButtonToggle(2, true)} // Press down
        onMouseUp={() => handleButtonToggle(2, false)} // Release
        onTouchStart={() => handleButtonToggle(2, true)} // Touch start (for mobile)
        onTouchEnd={() => handleButtonToggle(2, false)} // Touch end (for mobile)
      >
        <div className="x-axis-line"></div>
        <div className="y-axis-line"></div>
        {isGyroscopeActive && <div className="inner-circle"></div>}
      </div>

      {/* Small Ball moves based on orientation */}
      <Draggable
        position={ballPosition}
        onStart={handleStartDrag}
        onStop={handleStopDrag}
        onDrag={handleDrag}
        positionOffset={{ x: "0rem", y: "0rem" }} // in case is necessary to correct the position from Draggable
      >
        <div
          className="small-ball"
          style={{
            transform: `translate(-50%, -50%)`, // Centers the ball
          }}
        ></div>
      </Draggable>

      {/* Bottom buttons: Clear Glitch and Gyroscope Toggle Button */}
      <div className="bottom-buttons">
        {/* Long Push Button for Clear */}
        <div
          className={`clear-glitch-button ${buttonValues[0] ? "pressed" : ""}`}
          onMouseDown={handleClearGlitchStart}
          onMouseUp={handleClearGlitchEnd}
          onTouchStart={handleClearGlitchStart}
          onTouchEnd={handleClearGlitchEnd}
        >
          Clear
        </div>

        {/* New Large Button for Gyroscope Toggle */}
        <div
          className={`clear-glitch-button ${
            isGyroscopeActive ? "pressed" : ""
          }`} // Large button like Clear button
          onMouseDown={() => handleButtonToggle(3, true)} // Press down to activate gyroscope
          onMouseUp={() => handleButtonToggle(3, false)} // Release to deactivate gyroscope
          onTouchStart={() => handleButtonToggle(3, true)} // Mobile touch start
          onTouchEnd={() => handleButtonToggle(3, false)} // Mobile touch end
        >
          Gyroscope
        </div>
      </div>
    </div>
  );
}

//  // Render the component
//  return (
//   <div className="mobile-container">
//     {/* Draggable Logs */}
//     <Draggable>
//       <div className="log-container">
//         <ul>
//           {/* <li>ɑ: {formatValue(orientation.alpha)}</li>
//           <li>β: {formatValue(orientation.beta)}</li>
//           <li>γ: {formatValue(orientation.gamma)}</li> */}
//           <li>X-axis: {ballPosition.x.toFixed(0)}</li> {/* Log X-axis */}
//           <li>Y-axis: {ballPosition.y.toFixed(0)}</li> {/* Log Y-axis */}
//           <li>Gyroscope: {isGyroscopeActive ? "On" : "Off"}</li>
//           {/* <li>{lastEvent}</li> Display last event log here */}
//           {showClearLog && <li>Clear</li>}
//         </ul>
//       </div>
//     </Draggable>

//     {/* Large Circle that acts as a push button */}
//     <div
//       className={`large-circle ${isGyroscopeActive ? "toggled" : ""}`}
//       onMouseDown={() => handleButtonToggle(2, true)} // Press down
//       onMouseUp={() => handleButtonToggle(2, false)} // Release
//       onTouchStart={() => handleButtonToggle(2, true)} // Touch start (for mobile)
//       onTouchEnd={() => handleButtonToggle(2, false)} // Touch end (for mobile)
//     >
//       <div className="x-axis-line"></div>
//       <div className="y-axis-line"></div>
//       {isGyroscopeActive && <div className="inner-circle"></div>}
//     </div>

//     {/* Small Ball moves based on orientation within the full screen */}
//     <Draggable
//       position={ballPosition}
//       onStart={handleStartDrag}
//       onStop={handleStopDrag}
//       onDrag={handleDrag}
//       positionOffset={{ x: "0rem", y: "0rem" }} // in case is necessary to correct the position from Draggable
//     >
//       <div
//         className="small-ball"
//         style={{
//           transform: `translate(-50%, -50%)`, // Centers the ball
//         }}
//       ></div>
//     </Draggable>

//     {/* Faders on the top-left part */}
//     {/* <div className="faders-container">
//       <FadersGroup
//         faders={FadersDictionary}
//         values={faderValues}
//         handleChange={handleFaderChange}
//       />
//     </div> */}

//     {/* Bottom buttons: Clear Glitch and four small toggle buttons */}
//     <div className="bottom-buttons">
//       {/* Long Push Button */}
//       <div
//         className={`clear-glitch-button ${buttonValues[0] ? "pressed" : ""}`}
//         onMouseDown={handleClearGlitchStart}
//         onMouseUp={handleClearGlitchEnd}
//         onTouchStart={handleClearGlitchStart}
//         onTouchEnd={handleClearGlitchEnd}
//       >
//         Clear
//       </div>

//       {/* Toggle Buttons // for extende version change to: buttonValues.slice(1, 5).map... */}
//       {buttonValues.slice(1, 1).map((value, index) => (
//         <div
//           key={index}
//           className={`small-toggle-button ${value ? "active" : ""}`}
//           onClick={() => handleButtonToggle(index + 1)}
//           style={{ opacity: value ? 1 : 0.2 }}
//         ></div>
//       ))}
//     </div>
//   </div>
// );
// }

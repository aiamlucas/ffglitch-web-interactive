// src/App.js
import { useEffect, useState } from "react";
import AppDesktop from "./views/Desktop/AppDesktop";
import AppMobile from "./views/Mobile/AppMobile";

export default function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if the user is on mobile based on the screen width
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // 768px breakpoint for mobile
    };

    // Check on initial load
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <>{isMobile ? <AppMobile /> : <AppDesktop />}</>;
}

// import "./App.css";
// import "./global.css";
// import io from "socket.io-client";
// import { useEffect, useState, useRef } from "react";
// import Draggable from "react-draggable";
// import FadersGroup from "./components/FadersGroup/FadersGroup";
// import PanGroup from "./components/PanGroup/PanGroup";

// const socket = io.connect("http://localhost:3001");

// // Generate dictionaries for faders and pans
// const generateItemsDictionary = (numItems, prefix) => {
//   return Array.from({ length: numItems }, (_, i) => ({
//     name: `${prefix}${i + 1}`, // Corrected the syntax for string interpolation
//     value: 0,
//   }));
// };

// const FadersDictionary = generateItemsDictionary(25, "fader");
// const PansDictionary = generateItemsDictionary(2, "pan");

// export default function App() {
//   const [chatMessage, setChatMessage] = useState("");
//   const [chatMessagesReceived, setChatMessagesReceived] = useState([]);
//   const [mouseCoordinates, setMouseCoordinates] = useState({ x: 0, y: 0 });
//   const [faderValues, setFaderValues] = useState(
//     Array(FadersDictionary.length).fill(0)
//   );
//   const [panValues, setPanValues] = useState(
//     Array(PansDictionary.length).fill(0)
//   );

//   const chatMessageInputRef = useRef(null);

//   const numButtons = 15;
//   const [toggleValues, setToggleValues] = useState(Array(numButtons).fill(0));
//   const [panToggled, setPanToggled] = useState(false);

//   const [initialClickX, setInitialClickX] = useState(0);
//   const [initialClickY, setInitialClickY] = useState(0);
//   const [initialDivX, setInitialDivX] = useState(0);
//   const [initialDivY, setInitialDivY] = useState(0);

//   const [dragging, setDragging] = useState(false);

//   const containerRef = useRef(null);
//   const [zoomScale, setZoomScale] = useState(1);

//   // Event handlers
//   useEffect(() => {
//     const handleScroll = (event) => {
//       const delta = event.deltaY > 0 ? 0.1 : -0.1;
//       setZoomScale((prevScale) => prevScale + delta);
//     };

//     const containerElement = containerRef.current;
//     containerElement.addEventListener("wheel", handleScroll);

//     return () => {
//       containerElement.removeEventListener("wheel", handleScroll);
//     };
//   }, []);

//   const handleMouseAltKey = (event) => {
//     if (event.altKey) {
//       event.preventDefault();
//       setDragging(true);
//       const div = document.querySelector(".fader-container");
//       setInitialClickX(event.clientX);
//       setInitialClickY(event.clientY);
//       setInitialDivX(div.offsetLeft);
//       setInitialDivY(div.offsetTop);
//     }
//   };

//   const handleMouseMove = (event) => {
//     if (dragging) {
//       event.preventDefault();
//       const offsetX = event.clientX - initialClickX;
//       const offsetY = event.clientY - initialClickY;
//       const div = document.querySelector(".fader-container");
//       div.style.left = `${initialDivX + offsetX - 500}px`; // Corrected the syntax for string interpolation
//       div.style.top = `${initialDivY + offsetY}px`; // Corrected the syntax for string interpolation
//     }
//   };

//   const handleMouseUp = () => {
//     setDragging(false);
//   };

//   useEffect(() => {
//     document.addEventListener("mousemove", handleMouseMove);
//     document.addEventListener("mouseup", handleMouseUp);

//     return () => {
//       document.removeEventListener("mousemove", handleMouseMove);
//       document.removeEventListener("mouseup", handleMouseUp);
//     };
//   }, [dragging]);

//   // Socket event listeners
//   useEffect(() => {
//     socket.on("initial_fader_values", (data) => {
//       const initialValues = data.map((faderValue) => faderValue.value);
//       setFaderValues(initialValues);
//     });

//     socket.on("updated_fader_values", (data) => {
//       const updatedValues = data.map((faderValue) => faderValue.value);
//       setFaderValues(updatedValues);
//     });

//     return () => {
//       socket.off("initial_fader_values");
//       socket.off("updated_fader_values");
//     };
//   }, []);

//   useEffect(() => {
//     socket.on("initial_toggle_values", (data) => {
//       setToggleValues(data);
//     });

//     socket.on("updated_toggle_values", (data) => {
//       setToggleValues(data);
//     });

//     return () => {
//       socket.off("initial_toggle_values");
//       socket.off("updated_toggle_values");
//     };
//   }, []);

//   useEffect(() => {
//     socket.on("initial_pan_values", (data) => {
//       const initialValues = data.map((panValue) => panValue.value);
//       setPanValues(initialValues);
//     });

//     socket.on("updated_pan_values", (data) => {
//       const updatedValues = data.map((panValue) => panValue.value);
//       setPanValues(updatedValues);
//     });

//     return () => {
//       socket.off("initial_pan_values");
//       socket.off("updated_pan_values");
//     };
//   }, []);

//   // Handler for faders, pans and toggles

//   const handleFaderChange = (index, value) => {
//     const faderName = `fader${index + 1}`; // Corrected the syntax for string interpolation

//     setFaderValues((prevValues) => {
//       const newValues = [...prevValues];
//       newValues[index] = parseFloat(value);
//       return newValues;
//     });

//     socket.emit("send_message", {
//       fader: faderName,
//       message: parseFloat(value),
//     });
//   };

//   const handlePanChange = (index, value) => {
//     const panName = `pan${index + 1}`; // Corrected the syntax for string interpolation

//     setPanValues((prevValues) => {
//       const newValues = [...prevValues];
//       newValues[index] = parseFloat(value);
//       return newValues;
//     });

//     socket.emit("send_message", {
//       fader: panName,
//       message: parseFloat(value),
//     });
//   };

//   const handlePanToggle = () => {
//     setPanToggled((prevState) => !prevState);
//     setPanValues(Array(PansDictionary.length).fill(0));
//   };

//   const handleToggle = (toggle) => {
//     const updatedValue = toggleValues[toggle] === 0 ? 1 : 0;
//     socket.emit("send_toggle_value", { toggle, value: updatedValue });
//   };

//   // Message handlers
//   const sendChatMessage = () => {
//     socket.emit("send_message", { chatMessage });
//     chatMessageInputRef.current.value = "";
//   };

//   useEffect(() => {
//     socket.on("receive_message", (data) => {
//       const { chatMessage } = data;

//       if (typeof chatMessage === "string") {
//         setChatMessagesReceived((prevChatMessages) => {
//           const updatedChatMessages = [...prevChatMessages, chatMessage];
//           const trimmedChatMessages = updatedChatMessages.slice(-8);
//           return trimmedChatMessages;
//         });
//       }
//     });
//   }, []);

//   const displayedChatMessages = Array.isArray(chatMessagesReceived)
//     ? chatMessagesReceived.filter((_, index) => index % 2 !== 0)
//     : [];

//   const handleFaderContainerDoubleClick = () => {
//     handleToggle("button1");
//   };

//   const handleSpeechSynthContainerDoubleClick = () => {
//     handleToggle("button2");
//   };

//   const handleMouseGuitarContainerDoubleClick = () => {
//     handleToggle("button4");
//   };

//   const handleRecSoundDoubleClick = () => {
//     handleToggle("button5");
//   };

//   const handleMouseOnContainerDoubleClick = () => {
//     handleToggle("button6");
//   };

//   // Handlers for mouse events

//   const sendCoordinatesToBackend = (x, y) => {
//     socket.emit("send_message", { x, y });
//   };

//   const handleMouseMovement = (event) => {
//     const { clientX, clientY } = event;
//     setMouseCoordinates({ x: clientX, y: clientY });

//     if (toggleValues.button6 === 1) {
//       sendCoordinatesToBackend(clientX, clientY);
//     }
//   };

//   const handleKeyDown = (event) => {
//     if (event.key === "Enter") {
//       sendChatMessage();
//     }
//   };

//   // CSS classes for containers

//   const faderContainerClass = toggleValues.button1
//     ? "fader-container active"
//     : "fader-container";

//   const speechSynthContainerClass = toggleValues.button2
//     ? "message-input message-input-blue"
//     : "message-input";

//   const mouseGuitarContainerClass = toggleValues.button4
//     ? "mouse-guitar mouse-guitar-red"
//     : "mouse-guitar";

//   const recSoundContainerClass = toggleValues.button5
//     ? "rec-sound rec-sound-extra-red"
//     : "rec-sound";

//   const panContainerClass = toggleValues.button1
//     ? "pan-container active"
//     : "pan-container";

//   let intervalId;

//   // Handler for fader animation

//   const handleFaderToggle = (index) => {
//     const parameterName = FadersDictionary[index].name;

//     setFaderValues((prevValues) => {
//       const newValues = [...prevValues];
//       newValues[index] = newValues[index] === 0 ? 1 : 0;
//       return newValues;
//     });

//     const isActive = faderValues[index] === 1;

//     const animateFaderValues = () => {
//       const duration = 2000;
//       const steps = 60;
//       const initialValue = faderValues[index];
//       const targetValue = initialValue === 0 ? 1 : 0;
//       const stepValue = (targetValue - initialValue) / steps;

//       let currentValue = initialValue;
//       let stepCount = 0;

//       intervalId = setInterval(() => {
//         stepCount++;
//         currentValue += stepValue;

//         setFaderValues((prevValues) => {
//           const newValues = [...prevValues];
//           newValues[index] = currentValue;
//           return newValues;
//         });

//         socket.emit("send_message", {
//           fader: parameterName,
//           message: currentValue,
//         });

//         if (stepCount === steps) {
//           clearInterval(intervalId);
//           setFaderValues((prevValues) => {
//             const newValues = [...prevValues];
//             newValues[index] = targetValue;
//             return newValues;
//           });

//           setTimeout(animateFaderValues, duration);
//         }
//       }, duration / steps);
//     };

//     if (isActive) {
//       animateFaderValues();
//     } else {
//       clearInterval(intervalId);
//     }
//   };

//   return (
//     <div
//       className="App"
//       ref={containerRef}
//       style={{ transform: `scale(${zoomScale})` }} // Corrected the syntax for string interpolation
//     >
//       <div
//         onDoubleClick={handleFaderContainerDoubleClick}
//         className={faderContainerClass}
//         onMouseDown={handleMouseAltKey}
//       >
//         <FadersGroup
//           faders={FadersDictionary.slice(0, 5)}
//           values={faderValues}
//           handleChange={handleFaderChange}
//           handleToggle={handleFaderToggle}
//         />
//       </div>
//       <Draggable>
//         <div
//           className={speechSynthContainerClass}
//           onDoubleClick={handleSpeechSynthContainerDoubleClick}
//         >
//           <div className="message-history">
//             {displayedChatMessages.map((message, index) => (
//               <div key={index}>{message}</div>
//             ))}
//           </div>
//           <input
//             onChange={(event) => setChatMessage(event.target.value)}
//             onKeyDown={handleKeyDown}
//             ref={chatMessageInputRef}
//           />
//         </div>
//       </Draggable>
//       <Draggable>
//         <div
//           className={mouseGuitarContainerClass}
//           onDoubleClick={handleMouseGuitarContainerDoubleClick}
//           onMouseMove={handleMouseMovement}
//         ></div>
//       </Draggable>
//       <Draggable>
//         <div
//           className={`${mouseGuitarContainerClass} ${recSoundContainerClass} ${
//             toggleValues.button5 === 1 ? "red-rec blink-red" : ""
//           }`} // Corrected the syntax for className
//           onDoubleClick={handleRecSoundDoubleClick}
//           onMouseMove={handleMouseMovement}
//         ></div>
//       </Draggable>
//       <Draggable>
//         <div
//           className={`mouse-on ${toggleValues.button6 === 1 ? "blue" : ""}`} // Corrected the syntax for className
//           onDoubleClick={handleMouseOnContainerDoubleClick}
//           onMouseMove={handleMouseMovement}
//         ></div>
//       </Draggable>
//       <div
//         onDoubleClick={() => handleToggle("button2")}
//         className={panContainerClass}
//         onMouseDown={handleMouseAltKey}
//       >
//         <PanGroup
//           pans={PansDictionary}
//           values={panValues}
//           handleChange={handlePanChange}
//           handleToggle={handlePanToggle}
//         />
//       </div>
//     </div>
//   );
// }

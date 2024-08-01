import "./App.css";
import "./global.css";
import io from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import Draggable from "react-draggable";
import FadersGroup from "./components/FadersGroup/FadersGroup";
import PanGroup from "./components/PanGroup/PanGroup";

const socket = io.connect("http://localhost:3001");

// Generate dictionaries for faders and pans
const generateItemsDictionary = (numItems, prefix) => {
  return Array.from({ length: numItems }, (_, i) => ({
    name: `${prefix}${i + 1}`,
    value: 0,
  }));
};

const FadersDictionary = generateItemsDictionary(25, "fader");
const PansDictionary = generateItemsDictionary(2, "pan");

export default function App() {
  const [message, setMessage] = useState("");
  const [asciiMessage, setAsciiMessage] = useState("");
  const [messageRecieved, setMessageRecieved] = useState("");
  const [asciiMessageReceived, setAsciiMessageReceived] = useState([]);
  const [mouseCoordinates, setMouseCoordinates] = useState({ x: 0, y: 0 });
  const [faderValues, setFaderValues] = useState(
    Array(FadersDictionary.length).fill(0)
  );
  const [panValues, setPanValues] = useState(
    Array(PansDictionary.length).fill(0)
  );

  const messageInputRef = useRef(null);
  const asciiMessageInputRef = useRef(null);

  const numButtons = 15;
  const [toggleValues, setToggleValues] = useState(Array(numButtons).fill(0));

  const [initialClickX, setInitialClickX] = useState(0);
  const [initialClickY, setInitialClickY] = useState(0);
  const [initialDivX, setInitialDivX] = useState(0);
  const [initialDivY, setInitialDivY] = useState(0);

  const [dragging, setDragging] = useState(false);

  const containerRef = useRef(null);
  const [zoomScale, setZoomScale] = useState(1);

  // Event handlers
  useEffect(() => {
    const handleScroll = (event) => {
      const delta = event.deltaY > 0 ? 0.1 : -0.1;
      setZoomScale((prevScale) => prevScale + delta);
    };

    const containerElement = containerRef.current;
    containerElement.addEventListener("wheel", handleScroll);

    return () => {
      containerElement.removeEventListener("wheel", handleScroll);
    };
  }, []);

  const handleMouseAltKey = (event) => {
    if (event.altKey) {
      event.preventDefault();
      setDragging(true);
      const div = document.querySelector(".fader-container");
      setInitialClickX(event.clientX);
      setInitialClickY(event.clientY);
      setInitialDivX(div.offsetLeft);
      setInitialDivY(div.offsetTop);
    }
  };

  const handleMouseMove = (event) => {
    if (dragging) {
      event.preventDefault();
      const offsetX = event.clientX - initialClickX;
      const offsetY = event.clientY - initialClickY;
      const div = document.querySelector(".fader-container");
      div.style.left = `${initialDivX + offsetX - 500}px`;
      div.style.top = `${initialDivY + offsetY}px`;
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  // Socket event listeners
  useEffect(() => {
    socket.on("initial_fader_values", (data) => {
      const initialValues = data.map((faderValue) => faderValue.value);
      setFaderValues(initialValues);
    });

    socket.on("updated_fader_values", (data) => {
      const updatedValues = data.map((faderValue) => faderValue.value);
      setFaderValues(updatedValues);
    });

    return () => {
      socket.off("initial_fader_values");
      socket.off("updated_fader_values");
    };
  }, []);

  useEffect(() => {
    socket.on("initial_toggle_values", (data) => {
      setToggleValues(data);
    });

    socket.on("updated_toggle_values", (data) => {
      setToggleValues(data);
    });

    return () => {
      socket.off("initial_toggle_values");
      socket.off("updated_toggle_values");
    };
  }, []);

  useEffect(() => {
    socket.on("initial_pan_values", (data) => {
      const initialValues = data.map((panValue) => panValue.value);
      setPanValues(initialValues);
    });

    socket.on("updated_pan_values", (data) => {
      const updatedValues = data.map((panValue) => panValue.value);
      setPanValues(updatedValues);
    });

    return () => {
      socket.off("initial_pan_values");
      socket.off("updated_pan_values");
    };
  }, []);

  // Handler for faders, pans and toggles

  const handleFaderChange = (index, value) => {
    const faderName = `fader${index + 1}`;

    setFaderValues((prevValues) => {
      const newValues = [...prevValues];
      newValues[index] = parseFloat(value);
      return newValues;
    });

    socket.emit("send_message", {
      fader: faderName,
      message: parseFloat(value),
    });
  };

  const handlePanChange = (index, value) => {
    const panName = `pan${index + 1}`;

    setPanValues((prevValues) => {
      const newValues = [...prevValues];
      newValues[index] = parseFloat(value);
      return newValues;
    });

    socket.emit("send_message", {
      fader: panName,
      message: parseFloat(value),
    });
  };

  const handleToggle = (toggle) => {
    const updatedValue = toggleValues[toggle] === 0 ? 1 : 0;
    socket.emit("send_toggle_value", { toggle, value: updatedValue });
  };

  // Message handlers
  const sendMessage = () => {
    socket.emit("send_message", { message });
    messageInputRef.current.value = "";
  };

  const sendAsciiMessage = () => {
    socket.emit("send_message", { asciiMessage });
    asciiMessageInputRef.current.value = "";
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      const { message, asciiMessage } = data;

      if (typeof message === "string") {
        setMessageRecieved((prevMessages) => {
          const updatedMessages = [...prevMessages, message];
          const trimmedMessages = updatedMessages.slice(-8);
          return trimmedMessages;
        });
      }

      if (typeof asciiMessage === "string") {
        setAsciiMessageReceived((prevAsciiMessages) => {
          const updatedAsciiMessages = [...prevAsciiMessages, asciiMessage];
          const trimmedAsciiMessages = updatedAsciiMessages.slice(-8);
          return trimmedAsciiMessages;
        });
      }
    });
  }, []);

  const displayedMessages = Array.isArray(messageRecieved)
    ? messageRecieved.filter((_, index) => index % 2 !== 0)
    : [];

  const displayedAsciiMessages = Array.isArray(asciiMessageReceived)
    ? asciiMessageReceived.filter((_, index) => index % 2 !== 0)
    : [];

  const handleFaderContainerDoubleClick = () => {
    handleToggle("button1");
  };

  const handleSpeechSynthContainerDoubleClick = () => {
    handleToggle("button2");
  };

  const handleAsciiSynthContainerDoubleClick = () => {
    handleToggle("button3");
  };

  const handleMouseGuitarContainerDoubleClick = () => {
    handleToggle("button4");
  };

  const handleRecSoundDoubleClick = () => {
    handleToggle("button5");
  };

  const handleMouseOnContainerDoubleClick = () => {
    handleToggle("button6");
  };

  // Handlers for mouse events

  const sendCoordinatesToBackend = (x, y) => {
    socket.emit("send_message", { x, y });
  };

  const handleMouseMovement = (event) => {
    const { clientX, clientY } = event;
    setMouseCoordinates({ x: clientX, y: clientY });

    if (toggleValues.button6 === 1) {
      sendCoordinatesToBackend(clientX, clientY);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  const handleKeyDownAscii = (event) => {
    if (event.key === "Enter") {
      sendAsciiMessage();
    }
  };

  // CSS classes for containers

  const faderContainerClass = toggleValues.button1
    ? "fader-container active"
    : "fader-container";

  const speechSynthContainerClass = toggleValues.button2
    ? "message-input message-input-blue"
    : "message-input";

  const asciiSynthContainerClass = toggleValues.button3
    ? "message-input message-input-green"
    : "message-input";

  const mouseGuitarContainerClass = toggleValues.button4
    ? "mouse-guitar mouse-guitar-red"
    : "mouse-guitar";

  const recSoundContainerClass = toggleValues.button5
    ? "rec-sound rec-sound-extra-red"
    : "rec-sound";

  const panContainerClass = toggleValues.button1
    ? "pan-container active"
    : "pan-container";

  let intervalId;

  // Handler for fader animation

  const handleFaderToggle = (index) => {
    const parameterName = FadersDictionary[index].name;

    setFaderValues((prevValues) => {
      const newValues = [...prevValues];
      newValues[index] = newValues[index] === 0 ? 1 : 0;
      return newValues;
    });

    const isActive = faderValues[index] === 1;

    const animateFaderValues = () => {
      const duration = 2000;
      const steps = 60;
      const initialValue = faderValues[index];
      const targetValue = initialValue === 0 ? 1 : 0;
      const stepValue = (targetValue - initialValue) / steps;

      let currentValue = initialValue;
      let stepCount = 0;

      intervalId = setInterval(() => {
        stepCount++;
        currentValue += stepValue;

        setFaderValues((prevValues) => {
          const newValues = [...prevValues];
          newValues[index] = currentValue;
          return newValues;
        });

        socket.emit("send_message", {
          fader: parameterName,
          message: currentValue,
        });

        if (stepCount === steps) {
          clearInterval(intervalId);
          setFaderValues((prevValues) => {
            const newValues = [...prevValues];
            newValues[index] = targetValue;
            return newValues;
          });

          setTimeout(animateFaderValues, duration);
        }
      }, duration / steps);
    };

    if (isActive) {
      animateFaderValues();
    } else {
      clearInterval(intervalId);
    }
  };

  return (
    <div
      className="App"
      ref={containerRef}
      style={{ transform: `scale(${zoomScale})` }}
    >
      <div
        onDoubleClick={handleFaderContainerDoubleClick}
        className={faderContainerClass}
        onMouseDown={handleMouseAltKey}
      >
        <FadersGroup
          faders={FadersDictionary.slice(0, 5)}
          values={faderValues}
          handleChange={handleFaderChange}
          handleToggle={handleFaderToggle}
        />
      </div>
      <Draggable>
        <div
          className={speechSynthContainerClass}
          onDoubleClick={handleSpeechSynthContainerDoubleClick}
        >
          <div className="message-history">
            {displayedMessages.map((message, index) => (
              <div key={index}>{message}</div>
            ))}
          </div>
          <input
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            ref={messageInputRef}
          />
        </div>
      </Draggable>
      <Draggable>
        <div
          className={asciiSynthContainerClass}
          onDoubleClick={handleAsciiSynthContainerDoubleClick}
        >
          <div className="message-history">
            {displayedAsciiMessages.map((message, index) => (
              <div key={index}>{message}</div>
            ))}
          </div>
          <input
            onChange={(event) => setAsciiMessage(event.target.value)}
            onKeyDown={handleKeyDownAscii}
            ref={asciiMessageInputRef}
          />
        </div>
      </Draggable>
      <Draggable>
        <div
          className={mouseGuitarContainerClass}
          onDoubleClick={handleMouseGuitarContainerDoubleClick}
          onMouseMove={handleMouseMovement}
        ></div>
      </Draggable>
      <Draggable>
        <div
          className={`${mouseGuitarContainerClass} ${recSoundContainerClass} ${
            toggleValues.button5 === 1 ? "red-rec blink-red" : ""
          }`}
          onDoubleClick={handleRecSoundDoubleClick}
          onMouseMove={handleMouseMovement}
        ></div>
      </Draggable>
      <Draggable>
        <div
          className={`mouse-on ${toggleValues.button6 === 1 ? "blue" : ""}`}
          onDoubleClick={handleMouseOnContainerDoubleClick}
          onMouseMove={handleMouseMovement}
        ></div>
      </Draggable>
      <div
        onDoubleClick={() => handleToggle("button2")}
        className={panContainerClass}
        onMouseDown={handleMouseAltKey}
      >
        <PanGroup
          pans={PansDictionary}
          values={panValues}
          handleChange={handlePanChange}
          handleToggle={handleFaderToggle}
        />
      </div>
    </div>
  );
}
// ___________________________________________________________________________
// import "./App.css";
// import "./global.css";
// import io from "socket.io-client";
// import { useEffect, useState, useRef } from "react";
// import Draggable from "react-draggable";
// import FadersGroup from "./components/FadersGroup/FadersGroup";
// import PanGroup from "./components/PanGroup/PanGroup";

// const socket = io.connect("http://localhost:3001");

// const generateFadersDictionary = (numFaders) => {
//   const faders = [];
//   for (let i = 1; i <= numFaders; i++) {
//     faders.push({ name: `fader${i}`, value: 0 });
//   }
//   return faders;
// };
// const FadersDictionary = generateFadersDictionary(25);

// const generatePansDictionary = (numPans) => {
//   const pans = [];
//   for (let i = 1; i <= numPans; i++) {
//     pans.push({ name: `pan${i}`, value: 0 });
//   }
//   return pans;
// };
// const PansDictionary = generatePansDictionary(2);

// export default function App() {
//   const [message, setMessage] = useState("");
//   const [asciiMessage, setAsciiMessage] = useState("");
//   const [messageRecieved, setMessageRecieved] = useState("");
//   const [asciiMessageReceived, setAsciiMessageReceived] = useState([]);
//   const [mouseCoordinates, setMouseCoordinates] = useState({ x: 0, y: 0 });
//   const [faderValues, setFaderValues] = useState(
//     Array(FadersDictionary.length).fill(0)
//   );
//   const [panValues, setPanValues] = useState(
//     Array(PansDictionary.length).fill(0)
//   );

//   const messageInputRef = useRef(null);
//   const asciiMessageInputRef = useRef(null);

//   const [toggleValues, setToggleValues] = useState({
//     button1: 0,
//     button2: 0,
//     button3: 0,
//     button4: 0,
//     button5: 0,
//     button6: 0,
//     button7: 0,
//     button8: 0,
//     button9: 0,
//     button10: 0,
//     button11: 0,
//     button12: 0,
//     button13: 0,
//     button14: 0,
//     button15: 0,
//   });

//   const [initialClickX, setInitialClickX] = useState(0);
//   const [initialClickY, setInitialClickY] = useState(0);
//   const [initialDivX, setInitialDivX] = useState(0);
//   const [initialDivY, setInitialDivY] = useState(0);

//   const [dragging, setDragging] = useState(false);

//   const containerRef = useRef(null);
//   const [zoomScale, setZoomScale] = useState(1);

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
//       div.style.left = `${initialDivX + offsetX - 500}px`;
//       div.style.top = `${initialDivY + offsetY}px`;
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

//   const handleFaderChange = (index, value) => {
//     const faderName = `fader${index + 1}`;

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
//     const panName = `pan${index + 1}`;

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

//   const handleToggle = (toggle) => {
//     const updatedValue = toggleValues[toggle] === 0 ? 1 : 0;
//     socket.emit("send_toggle_value", { toggle, value: updatedValue });
//   };

//   const sendMessage = () => {
//     socket.emit("send_message", { message });
//     messageInputRef.current.value = "";
//   };

//   const sendAsciiMessage = () => {
//     socket.emit("send_message", { asciiMessage });
//     asciiMessageInputRef.current.value = "";
//   };

//   useEffect(() => {
//     socket.on("receive_message", (data) => {
//       const { message, asciiMessage } = data;

//       if (typeof message === "string") {
//         setMessageRecieved((prevMessages) => {
//           const updatedMessages = [...prevMessages, message];
//           const trimmedMessages = updatedMessages.slice(-8);
//           return trimmedMessages;
//         });
//       }

//       if (typeof asciiMessage === "string") {
//         setAsciiMessageReceived((prevAsciiMessages) => {
//           const updatedAsciiMessages = [...prevAsciiMessages, asciiMessage];
//           const trimmedAsciiMessages = updatedAsciiMessages.slice(-8);
//           return trimmedAsciiMessages;
//         });
//       }
//     });
//   }, []);

//   const displayedMessages = Array.isArray(messageRecieved)
//     ? messageRecieved.filter((_, index) => index % 2 !== 0)
//     : [];

//   const displayedAsciiMessages = Array.isArray(asciiMessageReceived)
//     ? asciiMessageReceived.filter((_, index) => index % 2 !== 0)
//     : [];

//   const handleFaderContainerDoubleClick = () => {
//     handleToggle("button1");
//   };

//   const handleSpeechSynthContainerDoubleClick = () => {
//     handleToggle("button2");
//   };

//   const handleAsciiSynthContainerDoubleClick = () => {
//     handleToggle("button3");
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
//       sendMessage();
//     }
//   };

//   const handleKeyDownAscii = (event) => {
//     if (event.key === "Enter") {
//       sendAsciiMessage();
//     }
//   };

//   const faderContainerClass = toggleValues.button1
//     ? "fader-container active"
//     : "fader-container";

//   const speechSynthContainerClass = toggleValues.button2
//     ? "message-input message-input-blue"
//     : "message-input";

//   const asciiSynthContainerClass = toggleValues.button3
//     ? "message-input message-input-green"
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
//       style={{ transform: `scale(${zoomScale})` }}
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
//             {displayedMessages.map((message, index) => (
//               <div key={index}>{message}</div>
//             ))}
//           </div>
//           <input
//             onChange={(event) => setMessage(event.target.value)}
//             onKeyDown={handleKeyDown}
//             ref={messageInputRef}
//           />
//         </div>
//       </Draggable>
//       <Draggable>
//         <div
//           className={asciiSynthContainerClass}
//           onDoubleClick={handleAsciiSynthContainerDoubleClick}
//         >
//           <div className="message-history">
//             {displayedAsciiMessages.map((message, index) => (
//               <div key={index}>{message}</div>
//             ))}
//           </div>
//           <input
//             onChange={(event) => setAsciiMessage(event.target.value)}
//             onKeyDown={handleKeyDownAscii}
//             ref={asciiMessageInputRef}
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
//           }`}
//           onDoubleClick={handleRecSoundDoubleClick}
//           onMouseMove={handleMouseMovement}
//         ></div>
//       </Draggable>
//       <Draggable>
//         <div
//           className={`mouse-on ${toggleValues.button6 === 1 ? "blue" : ""}`}
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
//           handleToggle={handleFaderToggle}
//         />
//       </div>
//     </div>
//   );
// }

import "./App.css";
import "./global.css";
import io from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import Draggable from "react-draggable";

const socket = io.connect("http://localhost:3001");

const generateFadersDictionary = (numFaders) => {
  const faders = [];
  for (let i = 1; i <= numFaders; i++) {
    faders.push({ name: `fader${i}`, value: 0 });
  }
  return faders;
};
const FadersDictionary = generateFadersDictionary(25);

const generatePansDictionary = (numPans) => {
  const pans = [];
  for (let i = 1; i <= numPans; i++) {
    pans.push({ name: `pan${i}`, value: 0 });
  }
  return pans;
};
const PansDictionary = generatePansDictionary(2);

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

  const [toggleValues, setToggleValues] = useState({
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
  });

  const [initialClickX, setInitialClickX] = useState(0);
  const [initialClickY, setInitialClickY] = useState(0);
  const [initialDivX, setInitialDivX] = useState(0);
  const [initialDivY, setInitialDivY] = useState(0);

  const [dragging, setDragging] = useState(false);

  const containerRef = useRef(null);
  const [zoomScale, setZoomScale] = useState(1);

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

  // const handleFaderToggle = (index) => {
  //   const parameterName = FadersDictionary[index].name;

  //   setFaderValues((prevValues) => {
  //     const newValues = [...prevValues];
  //     newValues[index] = newValues[index] === 0 ? 1 : 0;
  //     return newValues;
  //   });

  //   const isActive = faderValues[index] === 1;

  //   const animateFaderValues = () => {
  //     const duration = 2000;
  //     const steps = 60;
  //     const initialValue = faderValues[index];
  //     const targetValue = initialValue === 0 ? 1 : 0;
  //     const stepValue = (targetValue - initialValue) / steps;

  //     let currentValue = initialValue;
  //     let stepCount = 0;

  //     intervalId = setInterval(() => {
  //       stepCount++;
  //       currentValue += stepValue;

  //       setFaderValues((prevValues) => {
  //         const newValues = [...prevValues];
  //         newValues[index] = currentValue;
  //         return newValues;
  //       });

  //       socket.emit("send_message", {
  //         fader: parameterName,
  //         message: currentValue,
  //       });

  //       if (stepCount === steps) {
  //         clearInterval(intervalId);
  //         setFaderValues((prevValues) => {
  //           const newValues = [...prevValues];
  //           newValues[index] = targetValue;
  //           return newValues;
  //         });

  //         setTimeout(animateFaderValues, duration);
  //       }
  //     }, duration / steps);
  //   };

  //   if (isActive) {
  //     animateFaderValues();
  //   } else {
  //     clearInterval(intervalId);
  //   }
  // };

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
        {FadersDictionary.filter(
          (fader) =>
            fader.name === "fader1" ||
            fader.name === "fader2" ||
            fader.name === "fader3" ||
            fader.name === "fader4" ||
            fader.name === "fader5"
        ).map((fader, index) => (
          <div key={`fader${index}`}>
            <div
              className="fader-label-div"
              onClick={() => handleFaderToggle(FadersDictionary.indexOf(fader))}
            >
              {fader.name}
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.0000000000000001}
              value={faderValues[FadersDictionary.indexOf(fader)]}
              className="fader-range"
              onChange={(event) =>
                handleFaderChange(
                  FadersDictionary.indexOf(fader),
                  event.target.value
                )
              }
            />
          </div>
        ))}
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
        {PansDictionary.map((pan, index) => (
          <div key={`pan${index}`}>
            <div className="fader-label-div">{pan.name}</div>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.01}
              value={panValues[index]}
              className="fader-range"
              onChange={(event) => handlePanChange(index, event.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// _________________________________________________________________________________________
// import "./App.css";
// import "./global.css";
// import io from "socket.io-client";
// import { useEffect, useState, useRef } from "react";
// import Draggable from "react-draggable";

// const socket = io.connect("http://localhost:3001");

// const ProxyChainParameterList = [
//   { name: "gain", value: 1 },
//   { name: "lpfi", value: 1000 },
//   { name: "lpf", value: 1000 },
//   { name: "eq", value: 0 },
//   { name: "ffreq", value: 150 },
//   { name: "ringmodM", value: 0 },
//   { name: "ringF", value: 0.5 },
//   { name: "maxFr", value: 3000 },
//   { name: "minFr", value: 300 },
//   { name: "ringmodA", value: 0 },
//   { name: "randrate", value: 5 },
//   { name: "dist", value: 0 },
//   { name: "drive", value: 10 },
//   { name: "amp", value: 0.2 },
//   { name: "dly", value: 0 },
//   { name: "dt1", value: 0.4 },
//   { name: "dt2", value: 0.5 },
//   { name: "dcy", value: 2 },
//   { name: "ghost", value: 0.01 },
//   { name: "limit", value: 0 },
//   { name: "freq", value: 0 },
//   { name: "dt", value: 0 },
//   { name: "sustain", value: 0 },
//   { name: "bendVar", value: 0 },
//   { name: "bend", value: 0 },
// ];

// export default function App() {
//   const [message, setMessage] = useState("");
//   const [asciiMessage, setAsciiMessage] = useState("");
//   const [messageRecieved, setMessageRecieved] = useState("");
//   const [asciiMessageReceived, setAsciiMessageReceived] = useState([]);
//   const [mouseCoordinates, setMouseCoordinates] = useState({ x: 0, y: 0 });
//   // const [recordValue, setRecordValue] = useState("abcሴ1.2");
//   const [faderProxyChainValues, setFaderProxyChainValues] = useState(
//     Array(ProxyChainParameterList.length).fill(0)
//   );

//   // const inputRef = useRef(null);
//   const messageInputRef = useRef(null);
//   const asciiMessageInputRef = useRef(null);

//   const [toggleValues, setToggleValues] = useState({
//     LFPI: 0,
//     EQ: 0,
//     RingmodM: 0,
//     RingmodA: 0,
//     Dist: 0,
//     Dly: 0,
//     Limit: 0,
//     Pchtrk: 0,
//     PingbendInstrument: 0,
//     SpeechSynth: 0,
//     AsciiSynth: 0,
//     MouseGuitar: 0,
//     RecSound: 0,
//     MouseOn: 0,
//   });

//   const [initialClickX, setInitialClickX] = useState(0);
//   const [initialClickY, setInitialClickY] = useState(0);
//   const [initialDivX, setInitialDivX] = useState(0);
//   const [initialDivY, setInitialDivY] = useState(0);

//   const [dragging, setDragging] = useState(false);

//   // adding zoom
//   const containerRef = useRef(null);
//   const [zoomScale, setZoomScale] = useState(1);

//   useEffect(() => {
//     const handleScroll = (event) => {
//       // Increase or decrease the zoom scale based on scroll direction
//       const delta = event.deltaY > 0 ? 0.1 : -0.1;
//       setZoomScale((prevScale) => prevScale + delta);
//     };

//     const containerElement = containerRef.current;
//     containerElement.addEventListener("wheel", handleScroll);

//     // Clean up the event listener when the component unmounts
//     return () => {
//       containerElement.removeEventListener("wheel", handleScroll);
//     };
//   }, []);

//   //-----

//   const handleMouseAltKey = (event) => {
//     if (event.altKey) {
//       event.preventDefault();
//       // Handle mouse alternative key logic here
//       // For example, you can update the state to indicate that dragging has started
//       setDragging(true);

//       // Store the initial click position and current div position
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
//       // Handle mouse move logic here
//       // Calculate the position based on the initial click position and mouse movement relative to the window
//       const offsetX = event.clientX - initialClickX;
//       const offsetY = event.clientY - initialClickY;

//       // Update the position of the div based on the calculation
//       const div = document.querySelector(".fader-container");
//       div.style.left = `${initialDivX + offsetX - 500}px`;
//       div.style.top = `${initialDivY + offsetY}px`;
//     }
//   };

//   const handleMouseUp = () => {
//     // Handle mouse up logic here
//     // For example, update the state to indicate that dragging has stopped
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
//     // Listen for initial fader values from the server
//     socket.on("initial_fader_values", (data) => {
//       const initialValues = data.map((faderValue) => faderValue.value);
//       setFaderProxyChainValues(initialValues);
//     });

//     // Listen for updated fader values from the server
//     socket.on("updated_fader_values", (data) => {
//       const updatedValues = data.map((faderValue) => faderValue.value);
//       setFaderProxyChainValues(updatedValues);
//     });

//     return () => {
//       // Cleanup the event listeners when the component unmounts
//       socket.off("initial_fader_values");
//       socket.off("updated_fader_values");
//     };
//   }, []);

//   useEffect(() => {
//     // Listen for initial toggle values from the server
//     socket.on("initial_toggle_values", (data) => {
//       setToggleValues(data);
//     });

//     // Listen for updated toggle values from the server
//     socket.on("updated_toggle_values", (data) => {
//       setToggleValues(data);
//     });

//     return () => {
//       // Cleanup the event listeners when the component unmounts
//       socket.off("initial_toggle_values");
//       socket.off("updated_toggle_values");
//     };
//   }, []);

//   const handleFaderProxyChainChange = (index, value) => {
//     const parameterName = ProxyChainParameterList[index].name;

//     setFaderProxyChainValues((prevValues) => {
//       const newValues = [...prevValues];
//       newValues[index] = parseFloat(value);
//       return newValues;
//     });

//     socket.emit("send_message", {
//       fader: parameterName,
//       message: parseFloat(value),
//     });
//   };

//   const handleToggle = (toggle) => {
//     const updatedValue = toggleValues[toggle] === 0 ? 1 : 0;

//     // Send the updated toggle value to the server
//     socket.emit("send_toggle_value", { toggle, value: updatedValue });
//   };

//   const sendMessage = () => {
//     console.log("send message: ", message);
//     socket.emit("send_message", { message });
//     // inputRef.current.value = "";
//     messageInputRef.current.value = "";
//   };

//   const sendAsciiMessage = () => {
//     console.log("send message: ", asciiMessage);
//     socket.emit("send_message", { asciiMessage });
//     // inputRef.current.value = "";
//     asciiMessageInputRef.current.value = "";
//   };

//   useEffect(() => {
//     socket.on("receive_message", (data) => {
//       const { message, asciiMessage } = data;

//       if (typeof message === "string") {
//         setMessageRecieved((prevMessages) => {
//           const updatedMessages = [...prevMessages, message];
//           const trimmedMessages = updatedMessages.slice(-8);
//           console.log("Trimmed messages:", trimmedMessages);
//           return trimmedMessages;
//         });
//       }

//       if (typeof asciiMessage === "string") {
//         setAsciiMessageReceived((prevAsciiMessages) => {
//           const updatedAsciiMessages = [...prevAsciiMessages, asciiMessage];
//           const trimmedAsciiMessages = updatedAsciiMessages.slice(-8);
//           console.log("Trimmed ASCII messages:", trimmedAsciiMessages);
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

//   //Double Click toggle
//   const handleFaderContainerDoubleClick = () => {
//     // Toggle PingbendInstrument when the fader container is clicked
//     handleToggle("PingbendInstrument");
//   };

//   const handleSpeechSynthContainerDoubleClick = () => {
//     // Toggle PingbendInstrument when the speech container is clicked
//     handleToggle("SpeechSynth");
//   };

//   const handleAsciiSynthContainerDoubleClick = () => {
//     // Toggle PingbendInstrument when the speech container is clicked
//     handleToggle("AsciiSynth");
//   };

//   const handleMouseGuitarContainerDoubleClick = () => {
//     // Toggle PingbendInstrument when the speech container is clicked
//     handleToggle("MouseGuitar");
//   };

//   const handleRecSoundDoubleClick = () => {
//     // Toggle PingbendInstrument when the speech container is clicked
//     handleToggle("RecSound");
//   };

//   const handleMouseOnContainerDoubleClick = () => {
//     // Toggle PingbendInstrument when the speech container is clicked
//     handleToggle("MouseOn");
//   };

//   const sendCoordinatesToBackend = (x, y) => {
//     socket.emit("send_message", { x, y });
//   };

//   const handleMouseMovement = (event) => {
//     const { clientX, clientY } = event;
//     setMouseCoordinates({ x: clientX, y: clientY });

//     if (toggleValues.MouseOn === 1) {
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

//   const faderContainerClass = toggleValues.PingbendInstrument
//     ? "fader-container active"
//     : "fader-container";

//   const speechSynthContainerClass = toggleValues.SpeechSynth
//     ? "message-input message-input-blue"
//     : "message-input";

//   const asciiSynthContainerClass = toggleValues.AsciiSynth
//     ? "message-input message-input-green"
//     : "message-input";

//   const mouseGuitarContainerClass = toggleValues.MouseGuitar
//     ? "mouse-guitar mouse-guitar-red"
//     : "mouse-guitar";

//   const recSoundContainerClass = toggleValues.RecSound
//     ? "rec-sound rec-sound-extra-red"
//     : "rec-sound";

//   let intervalId;

//   const handleFaderToggle = (index) => {
//     const parameterName = ProxyChainParameterList[index].name;

//     setFaderProxyChainValues((prevValues) => {
//       const newValues = [...prevValues];
//       newValues[index] = newValues[index] === 0 ? 1 : 0;
//       return newValues;
//     });

//     const isActive = faderProxyChainValues[index] === 1;

//     console.log(`Fader ${parameterName} toggled. Active: ${isActive}`);
//     console.log("index Fader:", index);

//     const animateFaderValues = () => {
//       const duration = 2000; // Duration of each transition in milliseconds
//       const steps = 60; // Number of steps in each transition
//       const initialValue = faderProxyChainValues[index];
//       const targetValue = initialValue === 0 ? 1 : 0;
//       const stepValue = (targetValue - initialValue) / steps;

//       let currentValue = initialValue;
//       let stepCount = 0;

//       intervalId = setInterval(() => {
//         stepCount++;
//         currentValue += stepValue;

//         setFaderProxyChainValues((prevValues) => {
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
//           setFaderProxyChainValues((prevValues) => {
//             const newValues = [...prevValues];
//             newValues[index] = targetValue;
//             return newValues;
//           });

//           setTimeout(animateFaderValues, duration); // Start a new transition after a delay...
//         }
//       }, duration / steps);
//     };

//     if (isActive) {
//       animateFaderValues();
//     } else {
//       clearInterval(intervalId); // Stop the animation if toggle is inactive
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
//         {ProxyChainParameterList.filter(
//           (fader) =>
//             fader.name === "freq" ||
//             fader.name === "dt" ||
//             fader.name === "sustain" ||
//             fader.name === "bendVar" ||
//             fader.name === "bend"
//         ).map((fader, index) => (
//           <div key={`fader${index}`}>
//             <div
//               className="fader-label-div"
//               onClick={() =>
//                 handleFaderToggle(ProxyChainParameterList.indexOf(fader))
//               }
//             >
//               {fader.name}
//             </div>
//             {/* <p className="fader-label">{fader.name}</p> */}
//             <input
//               type="range"
//               min={0}
//               max={1}
//               step={0.0000000000000001}
//               value={
//                 faderProxyChainValues[ProxyChainParameterList.indexOf(fader)]
//               }
//               className="fader-range"
//               onChange={(event) =>
//                 handleFaderProxyChainChange(
//                   ProxyChainParameterList.indexOf(fader),
//                   event.target.value
//                 )
//               }
//             />
//           </div>
//         ))}
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
//             // placeholder="Message..."
//             onChange={(event) => setMessage(event.target.value)}
//             onKeyDown={handleKeyDown}
//             // ref={inputRef}
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
//             // placeholder="Message..."
//             onChange={(event) => setAsciiMessage(event.target.value)}
//             onKeyDown={handleKeyDownAscii}
//             // ref={inputRef}
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
//           // className={`${mouseGuitarContainerClass} ${recSoundContainerClass}`}
//           className={`${mouseGuitarContainerClass} ${recSoundContainerClass} ${
//             toggleValues.RecSound === 1 ? "red-rec blink-red" : ""
//           }`}
//           onDoubleClick={handleRecSoundDoubleClick}
//           onMouseMove={handleMouseMovement}
//         ></div>
//       </Draggable>
//       <Draggable>
//         <div
//           // className="mouse-on"
//           className={`mouse-on ${toggleValues.MouseOn === 1 ? "blue" : ""}`}
//           onDoubleClick={handleMouseOnContainerDoubleClick}
//           onMouseMove={handleMouseMovement}
//         ></div>
//       </Draggable>
//     </div>
//   );
// }

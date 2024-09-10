// src/Desktop/AppDesktop.js
import "../../App.css";
import "../../global.css";
import io from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import Draggable from "react-draggable";
import FadersGroup from "../../components/FadersGroup/FadersGroup";
import PanGroup from "../../components/PanGroup/PanGroup";

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

export default function AppDesktop() {
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessagesReceived, setChatMessagesReceived] = useState([]);
  const [mouseCoordinates, setMouseCoordinates] = useState({ x: 0, y: 0 });
  const [faderValues, setFaderValues] = useState(
    Array(FadersDictionary.length).fill(0)
  );
  const [panValues, setPanValues] = useState(
    Array(PansDictionary.length).fill(0)
  );

  const chatMessageInputRef = useRef(null);

  const numButtons = 15;
  const [toggleValues, setToggleValues] = useState(Array(numButtons).fill(0));

  // Define the missing state variables
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

  const sendChatMessage = () => {
    socket.emit("send_message", { chatMessage });
    chatMessageInputRef.current.value = "";
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      const { chatMessage } = data;

      if (typeof chatMessage === "string") {
        setChatMessagesReceived((prevChatMessages) => {
          const updatedChatMessages = [...prevChatMessages, chatMessage];
          const trimmedChatMessages = updatedChatMessages.slice(-8);
          return trimmedChatMessages;
        });
      }
    });
  }, []);

  const displayedChatMessages = Array.isArray(chatMessagesReceived)
    ? chatMessagesReceived.filter((_, index) => index % 2 !== 0)
    : [];

  const handleFaderContainerDoubleClick = () => {
    handleToggle("button1");
  };

  const handleSpeechSynthContainerDoubleClick = () => {
    handleToggle("button2");
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

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendChatMessage();
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
        className="fader-container"
        onMouseDown={handleMouseAltKey}
      >
        <FadersGroup
          faders={FadersDictionary.slice(0, 5)}
          values={faderValues}
          handleChange={handleFaderChange}
          handleToggle={handleToggle}
        />
      </div>

      <Draggable>
        <div
          className="message-input"
          onDoubleClick={handleSpeechSynthContainerDoubleClick}
        >
          <div className="message-history">
            {displayedChatMessages.map((message, index) => (
              <div key={index}>{message}</div>
            ))}
          </div>
          <input
            onChange={(event) => setChatMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            ref={chatMessageInputRef}
          />
        </div>
      </Draggable>

      <Draggable>
        <div
          className="mouse-guitar"
          onDoubleClick={handleMouseGuitarContainerDoubleClick}
        ></div>
      </Draggable>

      <Draggable>
        <div
          className={`rec-sound ${
            toggleValues.button5 === 1 ? "red-rec blink-red" : ""
          }`}
          onDoubleClick={handleRecSoundDoubleClick}
        ></div>
      </Draggable>

      <Draggable>
        <div
          className={`mouse-on ${toggleValues.button6 === 1 ? "blue" : ""}`}
          onDoubleClick={handleMouseOnContainerDoubleClick}
        ></div>
      </Draggable>

      <div
        className="pan-container"
        onDoubleClick={() => handleToggle("button2")}
      >
        <PanGroup
          pans={PansDictionary}
          values={panValues}
          handleChange={handlePanChange}
          handleToggle={handlePanChange}
        />
      </div>
    </div>
  );
}

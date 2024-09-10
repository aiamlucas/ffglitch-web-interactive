// src/Mobile/AppMobile.js
import "../../App.css";
import "../../global.css";
import io from "socket.io-client";
import { useEffect, useState, useRef } from "react";
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

export default function AppMobile() {
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessagesReceived, setChatMessagesReceived] = useState([]);
  const [faderValues, setFaderValues] = useState(
    Array(FadersDictionary.length).fill(0)
  );
  const [panValues, setPanValues] = useState(
    Array(PansDictionary.length).fill(0)
  );

  const chatMessageInputRef = useRef(null);

  const numButtons = 15;
  const [toggleValues, setToggleValues] = useState(Array(numButtons).fill(0));

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

  // Handler for faders, pans, and toggles
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

  return (
    <div className="App">
      <div className="fader-container" onClick={() => handleToggle("button1")}>
        <FadersGroup
          faders={FadersDictionary.slice(0, 5)}
          values={faderValues}
          handleChange={handleFaderChange}
          handleToggle={handleFaderChange}
        />
      </div>

      <div
        className="message-input message-input-blue"
        onClick={() => handleToggle("button2")}
      >
        <div className="message-history">
          {displayedChatMessages.map((message, index) => (
            <div key={index}>{message}</div>
          ))}
        </div>
        <input
          onChange={(event) => setChatMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") sendChatMessage();
          }}
          ref={chatMessageInputRef}
        />
      </div>

      <div
        className="mouse-guitar mouse-guitar-red"
        onClick={() => handleToggle("button4")}
      ></div>

      <div
        className={`rec-sound ${
          toggleValues.button5 === 1 ? "red-rec blink-red" : ""
        }`}
        onClick={() => handleToggle("button5")}
      ></div>

      <div
        className={`mouse-on ${toggleValues.button6 === 1 ? "blue" : ""}`}
        onClick={() => handleToggle("button6")}
      ></div>

      <div className="pan-container" onClick={() => handleToggle("button2")}>
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

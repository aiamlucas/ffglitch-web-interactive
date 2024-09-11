// src/views/Mobile/AppMobile.js
import "../Mobile/AppMobile.css";
import { useState } from "react";
import "@fontsource/roboto"; // Import Roboto font
import { useDeviceOrientation } from "../../hooks/useDeviceOrientation"; // Import your hook
import io from "socket.io-client";

const socket = io("wss://localhost:3001", {
  secure: true,
  rejectUnauthorized: false, // Allow self-signed certificates
});

export default function AppMobile() {
  const { orientation, requestAccess, revokeAccess, error } =
    useDeviceOrientation(); // Use the hook
  const [isSmallToggled1, setIsSmallToggled1] = useState(false);
  const [isSmallToggled2, setIsSmallToggled2] = useState(false);
  const [isLongPressed, setIsLongPressed] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleLongPressStart = () => {
    setIsLongPressed(true);
  };

  const handleLongPressEnd = () => {
    setIsLongPressed(false);
  };

  const handleSmallToggleClick1 = () => {
    setIsSmallToggled1((prev) => !prev);
  };

  const handleSmallToggleClick2 = () => {
    setIsSmallToggled2((prev) => !prev);
  };

  const handlePressStart = (event) => {
    event.preventDefault();
    setIsPressed(true);
    requestAccess(); // Start fetching orientation data when button is pressed
  };

  const handlePressEnd = (event) => {
    event.preventDefault();
    setIsPressed(false);
    revokeAccess(); // Stop fetching orientation data when button is released
  };

  // Mapping the orientation values (alpha, beta, gamma) to -255 to 255 range
  const mapRange = (value, inMin, inMax, outMin, outMax) => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  };

  const mappedX = orientation?.beta
    ? Math.round(mapRange(orientation.beta, -180, 180, -255, 255))
    : 0;
  const mappedY = orientation?.gamma
    ? Math.round(mapRange(orientation.gamma, -90, 90, -255, 255))
    : 0;
  const mappedZ = orientation?.alpha
    ? Math.round(mapRange(orientation.alpha, 0, 360, -255, 255))
    : 0;

  return (
    <div className="mobile-container">
      {/* Fixed text container - always stays on top */}
      <div className="text-container">
        {isPressed && (
          <div>
            <h2>x: {mappedX}</h2>
            <h2>y: {mappedY}</h2>
            <h2>z: {mappedZ}</h2>
          </div>
        )}
        {error && <p className="error">{error.message}</p>}
      </div>

      {/* Large Button - Center */}
      <div
        className={`large-button ${isPressed ? "pressed" : ""}`}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
      ></div>

      {/* Bottom buttons: long push button and two smaller toggle buttons */}
      <div className="bottom-buttons">
        <div
          className={`long-push-button ${isLongPressed ? "pressed" : ""}`}
          onMouseDown={handleLongPressStart}
          onMouseUp={handleLongPressEnd}
          onTouchStart={handleLongPressStart}
          onTouchEnd={handleLongPressEnd}
        ></div>

        <div
          className={`small-toggle-button ${isSmallToggled1 ? "active" : ""}`}
          onClick={handleSmallToggleClick1}
        ></div>

        <div
          className={`small-toggle-button ${isSmallToggled2 ? "active" : ""}`}
          onClick={handleSmallToggleClick2}
        ></div>
      </div>
    </div>
  );
}

// // src/views/Mobile/AppMobile.js
// import "../Mobile/AppMobile.css";
// import { useState, useEffect } from "react";
// import "@fontsource/roboto"; // Import Roboto font

// export default function AppMobile() {
//   const [isSmallToggled1, setIsSmallToggled1] = useState(false);
//   const [isSmallToggled2, setIsSmallToggled2] = useState(false);
//   const [isLongPressed, setIsLongPressed] = useState(false);
//   const [isPressed, setIsPressed] = useState(false);
//   const [xValue, setXValue] = useState(0);
//   const [yValue, setYValue] = useState(0);

//   const mapRange = (value, inMin, inMax, outMin, outMax) => {
//     return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
//   };

//   useEffect(() => {
//     const handleMotionEvent = (event) => {
//       const { accelerationIncludingGravity } = event;
//       let rawX = accelerationIncludingGravity.x || 0;
//       let rawY = accelerationIncludingGravity.y || 0;

//       const mappedX = Math.round(mapRange(rawX, -9.8, 9.8, -255, 255));
//       const mappedY = Math.round(mapRange(rawY, -9.8, 9.8, -255, 255));

//       setXValue(mappedX);
//       setYValue(mappedY);
//     };

//     if (typeof DeviceMotionEvent.requestPermission === "function") {
//       DeviceMotionEvent.requestPermission()
//         .then((permissionState) => {
//           if (permissionState === "granted") {
//             window.addEventListener("devicemotion", handleMotionEvent);
//           }
//         })
//         .catch(console.error);
//     } else {
//       window.addEventListener("devicemotion", handleMotionEvent);
//     }

//     return () => {
//       window.removeEventListener("devicemotion", handleMotionEvent);
//     };
//   }, []);

//   const handleLongPressStart = () => {
//     setIsLongPressed(true);
//   };

//   const handleLongPressEnd = () => {
//     setIsLongPressed(false);
//   };

//   const handleSmallToggleClick1 = () => {
//     setIsSmallToggled1((prev) => !prev);
//   };

//   const handleSmallToggleClick2 = () => {
//     setIsSmallToggled2((prev) => !prev);
//   };

//   const handlePressStart = (event) => {
//     event.preventDefault();
//     setIsPressed(true);
//   };

//   const handlePressEnd = (event) => {
//     event.preventDefault();
//     setIsPressed(false);
//   };

//   return (
//     <div className="mobile-container">
//       {/* Fixed text container - always stays on top */}
//       <div className="text-container">
//         {isPressed && (
//           <div>
//             <h2>{xValue}</h2>
//             <h2>{yValue}</h2>
//           </div>
//         )}
//       </div>

//       {/* Large Button - Center */}
//       <div
//         className={`large-button ${isPressed ? "pressed" : ""}`}
//         onMouseDown={handlePressStart}
//         onMouseUp={handlePressEnd}
//         onTouchStart={handlePressStart}
//         onTouchEnd={handlePressEnd}
//       ></div>

//       {/* Bottom buttons: long push button and two smaller toggle buttons */}
//       <div className="bottom-buttons">
//         <div
//           className={`long-push-button ${isLongPressed ? "pressed" : ""}`}
//           onMouseDown={handleLongPressStart}
//           onMouseUp={handleLongPressEnd}
//           onTouchStart={handleLongPressStart}
//           onTouchEnd={handleLongPressEnd}
//         ></div>

//         <div
//           className={`small-toggle-button ${isSmallToggled1 ? "active" : ""}`}
//           onClick={handleSmallToggleClick1}
//         ></div>

//         <div
//           className={`small-toggle-button ${isSmallToggled2 ? "active" : ""}`}
//           onClick={handleSmallToggleClick2}
//         ></div>
//       </div>
//     </div>
//   );
// }

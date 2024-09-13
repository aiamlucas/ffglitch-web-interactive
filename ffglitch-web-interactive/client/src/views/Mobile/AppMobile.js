// src/views/Mobile/AppMobile.js
import "../Mobile/AppMobile.css";
import { useState } from "react";
import "@fontsource/roboto"; // Import Roboto font
import { useDeviceOrientation } from "../../hooks/useDeviceOrientation"; // Import your hook

export default function AppMobile() {
  const { orientation, requestAccess, revokeAccess, error } =
    useDeviceOrientation(); // Use the hook
  const [isTracking, setIsTracking] = useState(false);
  const [isLongPressed, setIsLongPressed] = useState(false);
  const [isSmallToggled1, setIsSmallToggled1] = useState(false);
  const [isSmallToggled2, setIsSmallToggled2] = useState(false);
  const [isSmallToggled3, setIsSmallToggled3] = useState(false);
  const [isSmallToggled4, setIsSmallToggled4] = useState(false);
  const [isLargeToggled, setIsLargeToggled] = useState(false); // New state for large button

  // Handlers for small toggle buttons
  const handleSmallToggleClick1 = () => setIsSmallToggled1((prev) => !prev);
  const handleSmallToggleClick2 = () => setIsSmallToggled2((prev) => !prev);
  const handleSmallToggleClick3 = () => setIsSmallToggled3((prev) => !prev);
  const handleSmallToggleClick4 = () => setIsSmallToggled4((prev) => !prev);

  // Handlers for long press button
  const handleLongPressStart = () => setIsLongPressed(true);
  const handleLongPressEnd = () => setIsLongPressed(false);

  // Handle toggling the large button (which is the circle now)
  const handleLargeToggleClick = async (event) => {
    event.preventDefault();
    setIsLargeToggled((prev) => {
      const newState = !prev;
      if (newState) {
        requestAccess(); // Start tracking
        setIsTracking(true);
      } else {
        revokeAccess(); // Stop tracking
        setIsTracking(false);
      }
      return newState;
    });
  };

  // Mapping the orientation values (alpha, beta, gamma) to -100 to 100 range for position
  const mapRange = (value, inMin, inMax, outMin, outMax) => {
    if (value === null || isNaN(value)) return 0; // Handle cases where the value might be null or NaN
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  };

  const centerX = 150; // Center x-coordinate of the large circle
  const centerY = 150; // Center y-coordinate of the large circle
  const radius = 100; // Radius of the large circle

  const mappedX = orientation?.beta
    ? mapRange(orientation.beta, -180, 180, -radius, radius)
    : 0;
  const mappedY = orientation?.gamma
    ? mapRange(orientation.gamma, -90, 90, -radius, radius)
    : 0;

  const ballX = centerX + mappedX;
  const ballY = centerY - mappedY; // Subtract to account for coordinate system

  return (
    <div className="mobile-container">
      {/* Fixed text container - always stays on top */}
      <div className="text-container">
        {isTracking && (
          <div>
            <h2>x: {Math.round(mappedX)}</h2>
            <h2>y: {Math.round(mappedY)}</h2>
            <ul>
              <li>Alpha (ɑ): {orientation.alpha}</li>
              <li>Beta (β): {orientation.beta}</li>
              <li>Gamma (γ): {orientation.gamma}</li>
            </ul>
          </div>
        )}
        {error && <p className="error">{error.message}</p>}
      </div>

      {/* Large Circle */}
      <div
        className={`large-circle ${isLargeToggled ? "toggled" : ""}`}
        onClick={handleLargeToggleClick}
      >
        {/* Small Ball */}
        <div
          className="small-ball"
          style={{
            transform: `translate(${ballX}px, ${ballY}px)`,
          }}
        ></div>
      </div>

      {/* Bottom buttons: long push button and four small toggle buttons */}
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

        <div
          className={`small-toggle-button ${isSmallToggled3 ? "active" : ""}`}
          onClick={handleSmallToggleClick3}
        ></div>

        <div
          className={`small-toggle-button ${isSmallToggled4 ? "active" : ""}`}
          onClick={handleSmallToggleClick4}
        ></div>
      </div>
    </div>
  );
}

// // src/views/Mobile/AppMobile.js
// import "../Mobile/AppMobile.css";
// import { useState } from "react";
// import "@fontsource/roboto"; // Import Roboto font
// import { useDeviceOrientation } from "../../hooks/useDeviceOrientation"; // Import your hook

// export default function AppMobile() {
//   const { orientation, requestAccess, revokeAccess, error } =
//     useDeviceOrientation(); // Use the hook
//   const [isTracking, setIsTracking] = useState(false);
//   const [isLargeToggled, setIsLargeToggled] = useState(false); // New state for large button

//   const handleLargeToggleClick = async (event) => {
//     event.preventDefault();
//     setIsLargeToggled((prev) => {
//       const newState = !prev;
//       if (newState) {
//         // Start tracking if the button is toggled on
//         requestAccess();
//         setIsTracking(true);
//       } else {
//         // Stop tracking if the button is toggled off
//         revokeAccess();
//         setIsTracking(false);
//       }
//       return newState;
//     });
//   };

//   // Mapping the orientation values (alpha, beta, gamma) to -100 to 100 range for position
//   const mapRange = (value, inMin, inMax, outMin, outMax) => {
//     if (value === null || isNaN(value)) return 0; // Handle cases where the value might be null or NaN
//     return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
//   };

//   const centerX = 100; // Center x-coordinate of the large circle
//   const centerY = 100; // Center y-coordinate of the large circle
//   const radius = 100; // Radius of the large circle

//   // Convert orientation values to position within the circle
//   const mappedX = orientation?.beta
//     ? mapRange(orientation.beta, -180, 180, -radius, radius)
//     : 0;
//   const mappedY = orientation?.gamma
//     ? mapRange(orientation.gamma, -90, 90, -radius, radius)
//     : 0;

//   const ballX = centerX + mappedX;
//   const ballY = centerY - mappedY; // Subtract to account for coordinate system

//   return (
//     <div className="mobile-container">
//       {/* Fixed text container - always stays on top */}
//       <div className="text-container">
//         {isTracking && (
//           <div>
//             <h2>x: {Math.round(mappedX)}</h2>
//             <h2>y: {Math.round(mappedY)}</h2>
//             <ul>
//               <li>Alpha (ɑ): {orientation.alpha}</li>
//               <li>Beta (β): {orientation.beta}</li>
//               <li>Gamma (γ): {orientation.gamma}</li>
//             </ul>
//           </div>
//         )}
//         {error && <p className="error">{error.message}</p>}
//       </div>

//       {/* Large Circle */}
//       <div
//         className={`large-circle ${isLargeToggled ? "toggled" : ""}`}
//         onClick={handleLargeToggleClick}
//       >
//         {/* Small Ball */}
//         <div
//           className="small-ball"
//           style={{
//             transform: `translate(${ballX - centerX}px, ${ballY - centerY}px)`,
//           }}
//         ></div>
//       </div>

//       {/* Bottom buttons: long push button and four small toggle buttons */}
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

// // src/views/Mobile/AppMobile.js
// import "../Mobile/AppMobile.css";
// import { useState } from "react";
// import "@fontsource/roboto"; // Import Roboto font
// import { useDeviceOrientation } from "../../hooks/useDeviceOrientation"; // Import your hook

// export default function AppMobile() {
//   const { orientation, requestAccess, revokeAccess, error } =
//     useDeviceOrientation(); // Use the hook
//   const [isTracking, setIsTracking] = useState(false);
//   const [isLargeToggled, setIsLargeToggled] = useState(false); // New state for large button

//   const handleLargeToggleClick = async (event) => {
//     event.preventDefault();
//     setIsLargeToggled((prev) => {
//       const newState = !prev;
//       if (newState) {
//         // Start tracking if the button is toggled on
//         requestAccess();
//         setIsTracking(true);
//       } else {
//         // Stop tracking if the button is toggled off
//         revokeAccess();
//         setIsTracking(false);
//       }
//       return newState;
//     });
//   };

//   // Mapping the orientation values (alpha, beta, gamma) to -100 to 100 range for position
//   const mapRange = (value, inMin, inMax, outMin, outMax) => {
//     if (value === null || isNaN(value)) return 0; // Handle cases where the value might be null or NaN
//     return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
//   };

//   const centerX = 150; // Center x-coordinate of the large circle
//   const centerY = 150; // Center y-coordinate of the large circle
//   const radius = 100; // Radius of the large circle

//   const mappedX = orientation?.beta
//     ? mapRange(orientation.beta, -180, 180, -radius, radius)
//     : 0;
//   const mappedY = orientation?.gamma
//     ? mapRange(orientation.gamma, -90, 90, -radius, radius)
//     : 0;

//   const ballX = centerX + mappedX;
//   const ballY = centerY - mappedY; // Subtract to account for coordinate system

//   return (
//     <div className="mobile-container">
//       {/* Fixed text container - always stays on top */}
//       <div className="text-container">
//         {isTracking && (
//           <div>
//             <h2>x: {Math.round(mappedX)}</h2>
//             <h2>y: {Math.round(mappedY)}</h2>
//             <ul>
//               <li>Alpha (ɑ): {orientation.alpha}</li>
//               <li>Beta (β): {orientation.beta}</li>
//               <li>Gamma (γ): {orientation.gamma}</li>
//             </ul>
//           </div>
//         )}
//         {error && <p className="error">{error.message}</p>}
//       </div>

//       {/* Large Circle */}
//       <div
//         className={`large-circle ${isLargeToggled ? "toggled" : ""}`}
//         onClick={handleLargeToggleClick}
//       >
//         {/* Small Ball */}
//         <div
//           className="small-ball"
//           style={{
//             transform: `translate(${ballX}px, ${ballY}px)`,
//           }}
//         ></div>
//       </div>
//     </div>
//   );
// }

// __________________________________
// // src/views/Mobile/AppMobile.js
// import "../Mobile/AppMobile.css";
// import { useState } from "react";
// import "@fontsource/roboto"; // Import Roboto font
// import { useDeviceOrientation } from "../../hooks/useDeviceOrientation"; // Import your hook

// export default function AppMobile() {
//   const { orientation, requestAccess, revokeAccess, error } =
//     useDeviceOrientation(); // Use the hook
//   const [isTracking, setIsTracking] = useState(false);
//   const [isSmallToggled1, setIsSmallToggled1] = useState(false);
//   const [isSmallToggled2, setIsSmallToggled2] = useState(false);
//   const [isSmallToggled3, setIsSmallToggled3] = useState(false); // New toggle button
//   const [isSmallToggled4, setIsSmallToggled4] = useState(false); // New toggle button
//   const [isLongPressed, setIsLongPressed] = useState(false);
//   const [isPressed, setIsPressed] = useState(false);
//   const [isLargeToggled, setIsLargeToggled] = useState(false); // New state for large button

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

//   const handleSmallToggleClick3 = () => {
//     setIsSmallToggled3((prev) => !prev); // Handle new toggle button
//   };

//   const handleSmallToggleClick4 = () => {
//     setIsSmallToggled4((prev) => !prev); // Handle new toggle button
//   };

//   const handleLargeToggleClick = async (event) => {
//     event.preventDefault();
//     setIsLargeToggled((prev) => {
//       const newState = !prev;
//       if (newState) {
//         // Start tracking if the button is toggled on
//         requestAccess();
//         setIsTracking(true);
//       } else {
//         // Stop tracking if the button is toggled off
//         revokeAccess();
//         setIsTracking(false);
//       }
//       return newState;
//     });
//   };

//   // Mapping the orientation values (alpha, beta, gamma) to -255 to 255 range
//   const mapRange = (value, inMin, inMax, outMin, outMax) => {
//     if (value === null || isNaN(value)) return 0; // Handle cases where the value might be null or NaN
//     return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
//   };

//   const mappedX = orientation?.beta
//     ? Math.round(mapRange(orientation.beta, -180, 180, -255, 255))
//     : 0;
//   const mappedY = orientation?.gamma
//     ? Math.round(mapRange(orientation.gamma, -90, 90, -255, 255))
//     : 0;
//   const mappedZ = orientation?.alpha
//     ? Math.round(mapRange(orientation.alpha, 0, 360, -255, 255))
//     : 0;

//   console.log("Orientation Values:", {
//     alpha: orientation?.alpha,
//     beta: orientation?.beta,
//     gamma: orientation?.gamma,
//   });
//   console.log("Mapped Values:", { mappedX, mappedY, mappedZ });

//   return (
//     <div className="mobile-container">
//       {/* Fixed text container - always stays on top */}
//       <div className="text-container">
//         {isTracking && (
//           <div>
//             <h2>x: {mappedX}</h2>
//             <h2>y: {mappedY}</h2>
//             <h2>z: {mappedZ}</h2>
//             <ul>
//               <li>Alpha (ɑ): {orientation.alpha}</li>
//               <li>Beta (β): {orientation.beta}</li>
//               <li>Gamma (γ): {orientation.gamma}</li>
//             </ul>
//           </div>
//         )}
//         {error && <p className="error">{error.message}</p>}
//       </div>

//       {/* Large Button - Center */}
//       <div
//         className={`large-button ${isLargeToggled ? "toggled" : ""}`}
//         onClick={handleLargeToggleClick}
//       ></div>

//       {/* Bottom buttons: long push button and four small toggle buttons */}
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

// ________________________

// // src/views/Mobile/AppMobile.js
// import "../Mobile/AppMobile.css";
// import { useState } from "react";
// import "@fontsource/roboto"; // Import Roboto font
// import { useDeviceOrientation } from "../../hooks/useDeviceOrientation"; // Import your hook
// import io from "socket.io-client";

// // Change this to https
// const socket = io.connect("https://localhost:3001", {
//   secure: true,
//   rejectUnauthorized: false, // To handle self-signed certificates
// });

// export default function AppMobile() {
//   const { orientation, requestAccess, revokeAccess, error } =
//     useDeviceOrientation(); // Use the hook
//   const [isSmallToggled1, setIsSmallToggled1] = useState(false);
//   const [isSmallToggled2, setIsSmallToggled2] = useState(false);
//   const [isLongPressed, setIsLongPressed] = useState(false);
//   const [isPressed, setIsPressed] = useState(false);

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
//     requestAccess(); // Start fetching orientation data when button is pressed
//   };

//   const handlePressEnd = (event) => {
//     event.preventDefault();
//     setIsPressed(false);
//     revokeAccess(); // Stop fetching orientation data when button is released
//   };

//   // Mapping the orientation values (alpha, beta, gamma) to -255 to 255 range
//   const mapRange = (value, inMin, inMax, outMin, outMax) => {
//     return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
//   };

//   const mappedX = orientation?.beta
//     ? Math.round(mapRange(orientation.beta, -180, 180, -255, 255))
//     : 0;
//   const mappedY = orientation?.gamma
//     ? Math.round(mapRange(orientation.gamma, -90, 90, -255, 255))
//     : 0;
//   const mappedZ = orientation?.alpha
//     ? Math.round(mapRange(orientation.alpha, 0, 360, -255, 255))
//     : 0;

//   return (
//     <div className="mobile-container">
//       {/* Fixed text container - always stays on top */}
//       <div className="text-container">
//         {isPressed && (
//           <div>
//             <h2>x: {mappedX}</h2>
//             <h2>y: {mappedY}</h2>
//             <h2>z: {mappedZ}</h2>
//           </div>
//         )}
//         {error && <p className="error">{error.message}</p>}
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

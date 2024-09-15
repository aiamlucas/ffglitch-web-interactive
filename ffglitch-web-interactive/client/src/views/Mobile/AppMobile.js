import "../Mobile/AppMobile.css";
import { useState } from "react";
import Draggable from "react-draggable"; // Import Draggable library
import "@fontsource/roboto"; // Import Roboto font
import { useDeviceOrientation } from "../../hooks/useDeviceOrientation"; // Import your hook

export default function AppMobile() {
  const { orientation, requestAccess, revokeAccess, error } =
    useDeviceOrientation(); // Use the hook
  const [isTracking, setIsTracking] = useState(false);
  const [isLargeToggled, setIsLargeToggled] = useState(false); // State for large button
  const [isSmallToggled1, setIsSmallToggled1] = useState(true); // X-axis toggle (default to enabled)
  const [isSmallToggled2, setIsSmallToggled2] = useState(true); // Y-axis toggle (default to enabled)
  const [isSmallToggled3, setIsSmallToggled3] = useState(true); // Additional toggle button
  const [isSmallToggled4, setIsSmallToggled4] = useState(true); // Additional toggle button
  const [isClearGlitch, setIsClearGlitch] = useState(false); // State for Clear Glitch button
  const [lastEvent, setLastEvent] = useState(""); // Store the last event

  const handleSmallToggleClick1 = () => {
    setIsSmallToggled1((prev) => !prev);
    setLastEvent(`X-Axis ${isSmallToggled1 ? "Off" : "On"}`);
  };

  const handleSmallToggleClick2 = () => {
    setIsSmallToggled2((prev) => !prev);
    setLastEvent(`Y-Axis ${isSmallToggled2 ? "Off" : "On"}`);
  };

  const handleSmallToggleClick3 = () => {
    setIsSmallToggled3((prev) => !prev);
    setLastEvent(`Toggle 1 ${isSmallToggled3 ? "Off" : "On"}`);
  };

  const handleSmallToggleClick4 = () => {
    setIsSmallToggled4((prev) => !prev);
    setLastEvent(`Toggle 2 ${isSmallToggled4 ? "Off" : "On"}`);
  };

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
      setLastEvent(`Circle ${newState ? "On" : "Off"}`);
      return newState;
    });
  };

  // Handle Clear Glitch button start and end
  const handleClearGlitchStart = () => {
    setIsClearGlitch(true);
    setLastEvent("Clear Glitch");
  };

  const handleClearGlitchEnd = () => {
    setIsClearGlitch(false);
  };

  // Map gyroscope values to the range between 0 and 100% of the screen width and height
  const mapGyroscopeToScreen = (value, minInput, maxInput) => {
    if (value === null || isNaN(value)) return 50; // Default to the center
    const mappedValue =
      ((value - minInput) * (100 - 0)) / (maxInput - minInput) + 0;
    return Math.max(0, Math.min(mappedValue, 100)); // Ensure it stays within 0% to 100%
  };

  const ballXPercent = isSmallToggled1
    ? mapGyroscopeToScreen(orientation?.gamma, -60, 60)
    : 50; // Lock to center when disabled

  const ballYPercent = isSmallToggled2
    ? mapGyroscopeToScreen(orientation?.beta, -45, 45)
    : 50; // Lock to center when disabled

  // Format values to have 2 digits after the comma
  const formatValue = (value) => (value !== null ? value.toFixed(2) : "0.00");

  return (
    <div className="mobile-container">
      {/* Draggable Logs */}
      <Draggable>
        <div className="log-container">
          <ul>
            <li>ɑ: {formatValue(orientation.alpha)}</li>
            <li>β: {formatValue(orientation.beta)}</li>
            <li>γ: {formatValue(orientation.gamma)}</li>
            <li>{lastEvent}</li> {/* Display last event log here */}
          </ul>
        </div>
      </Draggable>

      {/* Large Circle that acts as a toggle button */}
      <div
        className={`large-circle ${isLargeToggled ? "toggled" : ""}`}
        onClick={handleLargeToggleClick} // Toggle tracking on click
      >
        {/* X and Y axis lines */}
        {isLargeToggled && (
          <>
            <div className="x-axis-line"></div>
            <div className="y-axis-line"></div>
          </>
        )}

        {/* Inner Circle */}
        {isLargeToggled && <div className="inner-circle"></div>}
      </div>

      {/* Small Ball moves based on orientation within the full screen */}
      <div
        className="small-ball"
        style={{
          left: `${ballXPercent}%`,
          top: `${ballYPercent}%`,
        }}
      ></div>

      {/* Bottom buttons: Clear Glitch and four small toggle buttons */}
      <div className="bottom-buttons">
        <div
          className={`clear-glitch-button ${isClearGlitch ? "pressed" : ""}`}
          onMouseDown={handleClearGlitchStart}
          onMouseUp={handleClearGlitchEnd}
          onTouchStart={handleClearGlitchStart}
          onTouchEnd={handleClearGlitchEnd}
        ></div>

        <div
          className={`small-toggle-button ${isSmallToggled1 ? "active" : ""}`}
          onClick={handleSmallToggleClick1}
          style={{ opacity: isSmallToggled1 ? 1 : 0.2 }}
        ></div>

        <div
          className={`small-toggle-button ${isSmallToggled2 ? "active" : ""}`}
          onClick={handleSmallToggleClick2}
          style={{ opacity: isSmallToggled2 ? 1 : 0.2 }}
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
//   const [isLongPressed, setIsLongPressed] = useState(false); // State for long press button

//   const handleSmallToggleClick1 = () => setIsSmallToggled1((prev) => !prev);
//   const handleSmallToggleClick2 = () => setIsSmallToggled2((prev) => !prev);
//   const handleSmallToggleClick3 = () => setIsSmallToggled3((prev) => !prev);
//   const handleSmallToggleClick4 = () => setIsSmallToggled4((prev) => !prev);

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
//       return newState;
//     });
//   };

//   // Handle long press start and end
//   const handleLongPressStart = () => setIsLongPressed(true);
//   const handleLongPressEnd = () => setIsLongPressed(false);

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
//           style={{ opacity: isSmallToggled1 ? 1 : 0.2 }}
//         >
//           X
//         </div>

//         <div
//           className={`small-toggle-button ${isSmallToggled2 ? "active" : ""}`}
//           onClick={handleSmallToggleClick2}
//           style={{ opacity: isSmallToggled2 ? 1 : 0.2 }}
//         >
//           Y
//         </div>

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

// _______________________________________________________________________________________
// _______________________________________________________________________________________

// // src/views/Mobile/AppMobile.js
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
//   const [isLongPressed, setIsLongPressed] = useState(false); // State for long press button

//   const handleSmallToggleClick1 = () => setIsSmallToggled1((prev) => !prev);
//   const handleSmallToggleClick2 = () => setIsSmallToggled2((prev) => !prev);
//   const handleSmallToggleClick3 = () => setIsSmallToggled3((prev) => !prev);
//   const handleSmallToggleClick4 = () => setIsSmallToggled4((prev) => !prev);

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
//       return newState;
//     });
//   };

//   // Handle long press start and end
//   const handleLongPressStart = () => setIsLongPressed(true);
//   const handleLongPressEnd = () => setIsLongPressed(false);

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
//             <li>Alpha (ɑ): {formatValue(orientation.alpha)}</li>
//             <li>Beta (β): {formatValue(orientation.beta)}</li>
//             <li>Gamma (γ): {formatValue(orientation.gamma)}</li>
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

//       {/* Bottom buttons: long push button and four small toggle buttons */}
//       <div className="bottom-buttons">
//         <div
//           className={`long-push-button ${isLongPressed ? "pressed" : ""}`}
//           onMouseDown={handleLongPressStart}
//           onMouseUp={handleLongPressEnd}
//           onTouchStart={handleLongPressStart}
//           onTouchEnd={handleLongPressEnd}
//         >
//           Long Push
//         </div>

//         <div
//           className={`small-toggle-button ${isSmallToggled1 ? "active" : ""}`}
//           onClick={handleSmallToggleClick1}
//           style={{ opacity: isSmallToggled1 ? 1 : 0.2 }}
//         >
//           Toggle X
//         </div>

//         <div
//           className={`small-toggle-button ${isSmallToggled2 ? "active" : ""}`}
//           onClick={handleSmallToggleClick2}
//           style={{ opacity: isSmallToggled2 ? 1 : 0.2 }}
//         >
//           Toggle Y
//         </div>

//         <div
//           className={`small-toggle-button ${isSmallToggled3 ? "active" : ""}`}
//           onClick={handleSmallToggleClick3}
//         >
//           Toggle 3
//         </div>

//         <div
//           className={`small-toggle-button ${isSmallToggled4 ? "active" : ""}`}
//           onClick={handleSmallToggleClick4}
//         >
//           Toggle 4
//         </div>
//       </div>
//     </div>
//   );
// }

// // src/views/Mobile/AppMobile.js
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
//   const [isLongPressed, setIsLongPressed] = useState(false); // State for long press button

//   const handleSmallToggleClick1 = () => setIsSmallToggled1((prev) => !prev);
//   const handleSmallToggleClick2 = () => setIsSmallToggled2((prev) => !prev);
//   const handleSmallToggleClick3 = () => setIsSmallToggled3((prev) => !prev);
//   const handleSmallToggleClick4 = () => setIsSmallToggled4((prev) => !prev);

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
//       return newState;
//     });
//   };

//   // Handle long press start and end
//   const handleLongPressStart = () => setIsLongPressed(true);
//   const handleLongPressEnd = () => setIsLongPressed(false);

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
//             <li>Alpha (ɑ): {formatValue(orientation.alpha)}</li>
//             <li>Beta (β): {formatValue(orientation.beta)}</li>
//             <li>Gamma (γ): {formatValue(orientation.gamma)}</li>
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

//       {/* Bottom buttons: long push button and four small toggle buttons */}
//       <div className="bottom-buttons">
//         <div
//           className={`long-push-button ${isLongPressed ? "pressed" : ""}`}
//           onMouseDown={handleLongPressStart}
//           onMouseUp={handleLongPressEnd}
//           onTouchStart={handleLongPressStart}
//           onTouchEnd={handleLongPressEnd}
//         >
//           Long Push
//         </div>

//         <div
//           className={`small-toggle-button ${isSmallToggled1 ? "active" : ""}`}
//           onClick={handleSmallToggleClick1}
//         >
//           Toggle X
//         </div>

//         <div
//           className={`small-toggle-button ${isSmallToggled2 ? "active" : ""}`}
//           onClick={handleSmallToggleClick2}
//         >
//           Toggle Y
//         </div>

//         <div
//           className={`small-toggle-button ${isSmallToggled3 ? "active" : ""}`}
//           onClick={handleSmallToggleClick3}
//         >
//           Toggle 3
//         </div>

//         <div
//           className={`small-toggle-button ${isSmallToggled4 ? "active" : ""}`}
//           onClick={handleSmallToggleClick4}
//         >
//           Toggle 4
//         </div>
//       </div>
//     </div>
//   );
// }

// // src/views/Mobile/AppMobile.js
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
//   const [isLongPressed, setIsLongPressed] = useState(false); // State for long press button

//   const handleSmallToggleClick1 = () => setIsSmallToggled1((prev) => !prev);
//   const handleSmallToggleClick2 = () => setIsSmallToggled2((prev) => !prev);
//   const handleSmallToggleClick3 = () => setIsSmallToggled3((prev) => !prev);
//   const handleSmallToggleClick4 = () => setIsSmallToggled4((prev) => !prev);

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
//       return newState;
//     });
//   };

//   // Handle long press start and end
//   const handleLongPressStart = () => setIsLongPressed(true);
//   const handleLongPressEnd = () => setIsLongPressed(false);

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
//             <li>Alpha (ɑ): {formatValue(orientation.alpha)}</li>
//             <li>Beta (β): {formatValue(orientation.beta)}</li>
//             <li>Gamma (γ): {formatValue(orientation.gamma)}</li>
//           </ul>
//         </div>
//       </Draggable>

//       {/* Large Circle that acts as a toggle button */}
//       <div
//         className={`large-circle ${isLargeToggled ? "toggled" : ""}`}
//         onClick={handleLargeToggleClick} // Toggle tracking on click
//       >
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

//       {/* Bottom buttons: long push button and four small toggle buttons */}
//       <div className="bottom-buttons">
//         <div
//           className={`long-push-button ${isLongPressed ? "pressed" : ""}`}
//           onMouseDown={handleLongPressStart}
//           onMouseUp={handleLongPressEnd}
//           onTouchStart={handleLongPressStart}
//           onTouchEnd={handleLongPressEnd}
//         >
//           Long Push
//         </div>

//         <div
//           className={`small-toggle-button ${isSmallToggled1 ? "active" : ""}`}
//           onClick={handleSmallToggleClick1}
//         >
//           Toggle X
//         </div>

//         <div
//           className={`small-toggle-button ${isSmallToggled2 ? "active" : ""}`}
//           onClick={handleSmallToggleClick2}
//         >
//           Toggle Y
//         </div>

//         <div
//           className={`small-toggle-button ${isSmallToggled3 ? "active" : ""}`}
//           onClick={handleSmallToggleClick3}
//         >
//           Toggle 3
//         </div>

//         <div
//           className={`small-toggle-button ${isSmallToggled4 ? "active" : ""}`}
//           onClick={handleSmallToggleClick4}
//         >
//           Toggle 4
//         </div>
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
//   const [isLargeToggled, setIsLargeToggled] = useState(false); // State for large button
//   const [isSmallToggled1, setIsSmallToggled1] = useState(true); // X-axis toggle (default to enabled)
//   const [isSmallToggled2, setIsSmallToggled2] = useState(true); // Y-axis toggle (default to enabled)
//   const [isSmallToggled3, setIsSmallToggled3] = useState(false);
//   const [isSmallToggled4, setIsSmallToggled4] = useState(false);
//   const [isLongPressed, setIsLongPressed] = useState(false);

//   // Handlers for small toggle buttons
//   const handleSmallToggleClick1 = () => setIsSmallToggled1((prev) => !prev);
//   const handleSmallToggleClick2 = () => setIsSmallToggled2((prev) => !prev);
//   const handleSmallToggleClick3 = () => setIsSmallToggled3((prev) => !prev);
//   const handleSmallToggleClick4 = () => setIsSmallToggled4((prev) => !prev);

//   // Handlers for long press button
//   const handleLongPressStart = () => setIsLongPressed(true);
//   const handleLongPressEnd = () => setIsLongPressed(false);

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
//       return newState;
//     });
//   };

//   // Map gyroscope values to the range between 0 and 100% of the screen width and height
//   const mapGyroscopeToScreen = (value, minInput, maxInput) => {
//     if (value === null || isNaN(value)) return 50; // Default to the center
//     const mappedValue =
//       ((value - minInput) * (100 - 0)) / (maxInput - minInput) + 0;
//     return Math.max(0, Math.min(mappedValue, 100)); // Ensure it stays within 0% to 100%
//   };

//   // Conditionally update the ball's x and y position based on the toggle states
//   const ballXPercent = isSmallToggled1 // Only update if the x-axis toggle is active
//     ? mapGyroscopeToScreen(orientation?.gamma, -60, 60)
//     : 50; // Lock to center when disabled

//   const ballYPercent = isSmallToggled2 // Only update if the y-axis toggle is active
//     ? mapGyroscopeToScreen(orientation?.beta, -45, 45)
//     : 50; // Lock to center when disabled

//   return (
//     <div className="mobile-container">
//       {/* Fixed text container - always stays on top */}
//       <div className="text-container">
//         {isTracking && (
//           <div>
//             <h2>x: {Math.round(ballXPercent)}%</h2>
//             <h2>y: {Math.round(ballYPercent)}%</h2>
//             <ul>
//               <li>Alpha (ɑ): {orientation.alpha}</li>
//               <li>Beta (β): {orientation.beta}</li>
//               <li>Gamma (γ): {orientation.gamma}</li>
//             </ul>
//           </div>
//         )}
//         {error && <p className="error">{error.message}</p>}
//       </div>

//       {/* Large Circle that acts as a toggle button */}
//       <div
//         className={`large-circle ${isLargeToggled ? "toggled" : ""}`}
//         onClick={handleLargeToggleClick} // Toggle tracking on click
//       ></div>

//       {/* Small Ball moves based on orientation within the full screen */}
//       <div
//         className="small-ball"
//         style={{
//           left: `${ballXPercent}%`,
//           top: `${ballYPercent}%`,
//         }}
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
//         >
//           Toggle X
//         </div>

//         <div
//           className={`small-toggle-button ${isSmallToggled2 ? "active" : ""}`}
//           onClick={handleSmallToggleClick2}
//         >
//           Toggle Y
//         </div>

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

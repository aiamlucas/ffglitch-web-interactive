// src/views/Mobile/AppMobile.js
import "../Mobile/AppMobile.css";
import { useState, useEffect } from "react";

export default function AppMobile() {
  const [isSmallToggled1, setIsSmallToggled1] = useState(false); // State for small toggle button 1
  const [isSmallToggled2, setIsSmallToggled2] = useState(false); // State for small toggle button 2
  const [isLongPressed, setIsLongPressed] = useState(false); // State for long push button
  const [isPressed, setIsPressed] = useState(false); // State for large button
  const [xValue, setXValue] = useState(0); // State for x-axis value
  const [yValue, setYValue] = useState(0); // State for y-axis value

  // Map the accelerometer values to the range -255 to +255
  const mapRange = (value, inMin, inMax, outMin, outMax) => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  };

  useEffect(() => {
    const handleMotionEvent = (event) => {
      const { accelerationIncludingGravity } = event;
      let rawX = accelerationIncludingGravity.x || 0;
      let rawY = accelerationIncludingGravity.y || 0;

      // Map the raw accelerometer values to the range -255 to +255
      const mappedX = Math.round(mapRange(rawX, -9.8, 9.8, -255, 255));
      const mappedY = Math.round(mapRange(rawY, -9.8, 9.8, -255, 255));

      setXValue(mappedX);
      setYValue(mappedY);
    };

    // Request permission for iOS
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      DeviceMotionEvent.requestPermission()
        .then((permissionState) => {
          if (permissionState === "granted") {
            window.addEventListener("devicemotion", handleMotionEvent);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener("devicemotion", handleMotionEvent);
    }

    return () => {
      window.removeEventListener("devicemotion", handleMotionEvent);
    };
  }, []);

  // Push button handler for long button
  const handleLongPressStart = () => {
    setIsLongPressed(true); // Button pressed
  };

  const handleLongPressEnd = () => {
    setIsLongPressed(false); // Button released
  };

  // Toggle button handler for small toggle button 1
  const handleSmallToggleClick1 = () => {
    setIsSmallToggled1((prev) => !prev); // Toggle small button 1
  };

  // Toggle button handler for small toggle button 2
  const handleSmallToggleClick2 = () => {
    setIsSmallToggled2((prev) => !prev); // Toggle small button 2
  };

  // Handle press for the large button (start press)
  const handlePressStart = (event) => {
    event.preventDefault(); // Prevent default behavior on touchstart
    setIsPressed(true); // Set the large button as pressed
  };

  // Handle release for the large button (end press)
  const handlePressEnd = (event) => {
    event.preventDefault(); // Prevent default behavior on touchend
    setIsPressed(false); // Reset the large button as not pressed
  };

  return (
    <div className="mobile-container">
      {/* Display x and y values when the large button is pressed */}
      {isPressed && (
        <div>
          <h2>x: {xValue}</h2>
          <h2>y: {yValue}</h2>
        </div>
      )}

      {/* Large Button - Center */}
      <div
        className={`large-button ${isPressed ? "pressed" : ""}`}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
      >
        Press Me
      </div>

      {/* Bottom buttons: long push button and two smaller toggle buttons */}
      <div className="bottom-buttons">
        {/* Long Push Button */}
        <div
          className={`long-push-button ${isLongPressed ? "pressed" : ""}`}
          onMouseDown={handleLongPressStart}
          onMouseUp={handleLongPressEnd}
          onTouchStart={handleLongPressStart}
          onTouchEnd={handleLongPressEnd}
        >
          Long Push
        </div>

        {/* Small Toggle Button 1 */}
        <div
          className={`small-toggle-button ${isSmallToggled1 ? "active" : ""}`}
          onClick={handleSmallToggleClick1}
        >
          Toggle 1
        </div>

        {/* Small Toggle Button 2 */}
        <div
          className={`small-toggle-button ${isSmallToggled2 ? "active" : ""}`}
          onClick={handleSmallToggleClick2}
        >
          Toggle 2
        </div>
      </div>
    </div>
  );
}

// // src/views/Mobile/AppMobile.js
// import "../Mobile/AppMobile.css";
// import { useState } from "react";

// export default function AppMobile() {
//   const [isSmallToggled1, setIsSmallToggled1] = useState(false); // State for small toggle button 1
//   const [isSmallToggled2, setIsSmallToggled2] = useState(false); // State for small toggle button 2
//   const [isLongPressed, setIsLongPressed] = useState(false); // State for long push button
//   const [isPressed, setIsPressed] = useState(false); // State for large button

//   // Push button handler for long button
//   const handleLongPressStart = () => {
//     setIsLongPressed(true); // Button pressed
//   };

//   const handleLongPressEnd = () => {
//     setIsLongPressed(false); // Button released
//   };

//   // Toggle button handler for small toggle button 1
//   const handleSmallToggleClick1 = () => {
//     setIsSmallToggled1((prev) => !prev); // Toggle small button 1
//   };

//   // Toggle button handler for small toggle button 2
//   const handleSmallToggleClick2 = () => {
//     setIsSmallToggled2((prev) => !prev); // Toggle small button 2
//   };

//   // Handle press for the large button (start press)
//   const handlePressStart = (event) => {
//     event.preventDefault(); // Prevent default behavior on touchstart
//     setIsPressed(true); // Set the large button as pressed
//   };

//   // Handle release for the large button (end press)
//   const handlePressEnd = (event) => {
//     event.preventDefault(); // Prevent default behavior on touchend
//     setIsPressed(false); // Reset the large button as not pressed
//   };

//   return (
//     <div className="mobile-container">
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
//         {/* Long Push Button */}
//         <div
//           className={`long-push-button ${isLongPressed ? "pressed" : ""}`}
//           onMouseDown={handleLongPressStart}
//           onMouseUp={handleLongPressEnd}
//           onTouchStart={handleLongPressStart}
//           onTouchEnd={handleLongPressEnd}
//         ></div>

//         {/* Small Toggle Button 1 */}
//         <div
//           className={`small-toggle-button ${isSmallToggled1 ? "active" : ""}`}
//           onClick={handleSmallToggleClick1}
//         ></div>

//         {/* Small Toggle Button 2 */}
//         <div
//           className={`small-toggle-button ${isSmallToggled2 ? "active" : ""}`}
//           onClick={handleSmallToggleClick2}
//         ></div>
//       </div>
//     </div>
//   );
// }

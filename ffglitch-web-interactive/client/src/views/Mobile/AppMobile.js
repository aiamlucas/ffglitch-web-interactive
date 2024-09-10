// src/views/Mobile/AppMobile.js
import "../Mobile/AppMobile.css";
import { useState } from "react";

export default function AppMobile() {
  const [isSmallToggled1, setIsSmallToggled1] = useState(false); // State for small toggle button 1
  const [isSmallToggled2, setIsSmallToggled2] = useState(false); // State for small toggle button 2
  const [isLongPressed, setIsLongPressed] = useState(false); // State for long push button
  const [isPressed, setIsPressed] = useState(false); // State for large button

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
        {/* Long Push Button */}
        <div
          className={`long-push-button ${isLongPressed ? "pressed" : ""}`}
          onMouseDown={handleLongPressStart}
          onMouseUp={handleLongPressEnd}
          onTouchStart={handleLongPressStart}
          onTouchEnd={handleLongPressEnd}
        ></div>

        {/* Small Toggle Button 1 */}
        <div
          className={`small-toggle-button ${isSmallToggled1 ? "active" : ""}`}
          onClick={handleSmallToggleClick1}
        ></div>

        {/* Small Toggle Button 2 */}
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
// import { useState } from "react";

// export default function AppMobile() {
//   const [isToggled, setIsToggled] = useState(false); // State for toggle button
//   const [isPressed, setIsPressed] = useState(false); // State for large button

//   // Toggle button handler (toggles between on and off states)
//   const handleToggleClick = () => {
//     setIsToggled((prev) => !prev); // Toggle the button state immediately
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
//       {/* Toggle Button - Upper Right */}
//       <div
//         className={`toggle-button ${isToggled ? "active" : ""}`}
//         onClick={handleToggleClick} // Use onClick for both mobile and desktop
//       ></div>

//       {/* Large Button - Center */}
//       <div
//         className={`large-button ${isPressed ? "pressed" : ""}`}
//         onMouseDown={handlePressStart}
//         onMouseUp={handlePressEnd}
//         onTouchStart={handlePressStart}
//         onTouchEnd={handlePressEnd}
//       ></div>
//     </div>
//   );
// }

// src/views/Mobile/AppMobile.js
import "../Mobile/AppMobile.css";
import { useState } from "react";

export default function AppMobile() {
  const [isToggled, setIsToggled] = useState(false); // State for toggle button
  const [isPressed, setIsPressed] = useState(false); // State for large button

  // Toggle button handler (toggles between on and off states)
  const handleToggleClick = () => {
    setIsToggled((prev) => !prev); // Toggle the button state immediately
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
      {/* Toggle Button - Upper Right */}
      <div
        className={`toggle-button ${isToggled ? "active" : ""}`}
        onClick={handleToggleClick} // Use onClick for both mobile and desktop
      ></div>

      {/* Large Button - Center */}
      <div
        className={`large-button ${isPressed ? "pressed" : ""}`}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
      ></div>
    </div>
  );
}

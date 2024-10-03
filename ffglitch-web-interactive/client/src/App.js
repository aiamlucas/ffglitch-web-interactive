// src/App.js
import { useEffect, useState } from "react";
import AppMobile from "./views/Mobile/AppMobile";

// AppDesktop is not implemented yet
// import AppDesktop from "./views/Desktop/AppDesktop";

export default function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if the user is on mobile based on the screen width
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // 768px breakpoint for mobile
    };

    // Check on initial load
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // When AppDesktop is implemented, use this:
  // return <>{isMobile ? <AppMobile /> : <AppDesktop />}</>;

  return <>{isMobile ? <AppMobile /> : <AppMobile />}</>;
}
